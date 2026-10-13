import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { UsersTable } from './components/UsersTable';
import { UserModal } from './components/UserModal';
import { UserDetailsModal } from './components/UserDetailsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer } from './components/Toast';
import { EmptyState } from './components/EmptyState';
import { SearchIcon } from './components/Icons';

export function App() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modals state
  const [userModal, setUserModal] = useState({ isOpen: false, user: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  // Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch data from backend
  const loadData = useCallback(async (searchQuery = '', showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [usersRes, statsRes, healthRes] = await Promise.allSettled([
        api.getUsers(searchQuery),
        api.getUserStats(),
        api.getHealth()
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data || []);
      } else {
        console.error('Failed to load users:', usersRes.reason);
        addToast(usersRes.reason.message || 'Failed to fetch users from server.', 'error', 'Network Error');
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || null);
      }

      if (healthRes.status === 'fulfilled') {
        setDbHealth(healthRes.value);
      } else {
        setDbHealth({
          status: 'degraded',
          database: { status: 'disconnected', database: 'SaiketTask6DB' }
        });
      }
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    loadData('', true);
  }, [loadData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(searchTerm);
    addToast('Refreshing data from SQL Server...', 'info', 'Sync');
  };

  // Open modal handlers
  const handleOpenAddModal = () => {
    setUserModal({ isOpen: true, user: null });
  };

  const handleOpenEditModal = (user) => {
    setUserModal({ isOpen: true, user });
  };

  const handleOpenViewModal = (user) => {
    setDetailsModal({ isOpen: true, user });
  };

  const handleOpenDeleteModal = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  // CRUD Operations
  const handleSaveUser = async (formData) => {
    setIsSubmitting(true);
    try {
      if (userModal.user) {
        // Update user
        const res = await api.updateUser(userModal.user.Id, formData);
        addToast(res.message || 'User profile updated successfully.', 'success', 'Updated');
      } else {
        // Create user
        const res = await api.createUser(formData);
        addToast(res.message || 'User added successfully.', 'success', 'Created');
      }

      setUserModal({ isOpen: false, user: null });
      loadData(searchTerm);
    } catch (err) {
      console.error('Save user failed:', err);
      const msg = err.details?.length ? err.details.join(' ') : err.message;
      addToast(msg || 'Failed to save user.', 'error', 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (userId) => {
    setIsDeleting(true);
    try {
      const res = await api.deleteUser(userId);
      addToast(res.message || 'User deleted successfully.', 'success', 'Deleted');
      setDeleteModal({ isOpen: false, user: null });
      loadData(searchTerm);
    } catch (err) {
      console.error('Delete user failed:', err);
      addToast(err.message || 'Failed to delete user.', 'error', 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dbHealth={dbHealth}
      />

      <div className="main-wrapper">
        <Header
          onAddUser={handleOpenAddModal}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          dbHealth={dbHealth}
        />

        <main className="page-content">
          {/* Summary Metric Cards */}
          <StatsCards
            stats={stats}
            usersCount={users.length}
            dbHealth={dbHealth}
          />

          {/* Main User Table Section */}
          <section className="dashboard-panel">
            <div className="panel-toolbar">
              <div className="search-box">
                <SearchIcon className="search-icon w-5 h-5" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search users"
                />
              </div>

              <div className="toolbar-controls">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Showing <strong>{users.length}</strong> {users.length === 1 ? 'user' : 'users'}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="spinner dark" style={{ margin: '0 auto 16px', width: '32px', height: '32px' }}></div>
                <div>Loading user profiles from SQL Server...</div>
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                isSearch={Boolean(searchTerm.trim())}
                searchTerm={searchTerm}
                onAddUser={handleOpenAddModal}
                onClearSearch={() => setSearchTerm('')}
              />
            ) : (
              <UsersTable
                users={users}
                onView={handleOpenViewModal}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            )}
          </section>
        </main>
      </div>

      {/* Add / Edit User Modal */}
      <UserModal
        isOpen={userModal.isOpen}
        initialUser={userModal.user}
        onClose={() => setUserModal({ isOpen: false, user: null })}
        onSubmit={handleSaveUser}
        isSubmitting={isSubmitting}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={detailsModal.isOpen}
        user={detailsModal.user}
        onClose={() => setDetailsModal({ isOpen: false, user: null })}
        onEdit={(user) => {
          setDetailsModal({ isOpen: false, user: null });
          handleOpenEditModal(user);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        user={deleteModal.user}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;

