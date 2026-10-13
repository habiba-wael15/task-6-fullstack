import React from 'react';
import { EyeIcon, EditIcon, TrashIcon } from './Icons';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (_e) {
    return dateString;
  }
}

export function UsersTable({ users, onView, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="users-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>ID</th>
            <th>User</th>
            <th>Email</th>
            <th style={{ width: '100px' }}>Age</th>
            <th>Registered</th>
            <th style={{ textAlign: 'right', width: '140px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const initial = (user.Name || 'U').charAt(0).toUpperCase();
            const bgGradient = getAvatarColor(user.Name);

            return (
              <tr key={user.Id}>
                <td>
                  <span className="user-id-badge">#{user.Id}</span>
                </td>
                <td>
                  <div className="user-info-cell">
                    <div className="user-avatar" style={{ background: bgGradient }}>
                      {initial}
                    </div>
                    <div className="user-name-wrapper">
                      <div className="user-name">{user.Name}</div>
                      <div className="user-role">Member</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {user.Email}
                  </span>
                </td>
                <td>
                  <span className="age-badge">{user.Age} yrs</span>
                </td>
                <td>
                  <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                    {formatDate(user.CreatedAt)}
                  </span>
                </td>
                <td>
                  <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                    <button
                      className="action-btn view"
                      onClick={() => onView(user)}
                      title={`View details for ${user.Name}`}
                      aria-label="View user profile"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>

                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(user)}
                      title={`Edit ${user.Name}`}
                      aria-label="Edit user"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>

                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(user)}
                      title={`Delete ${user.Name}`}
                      aria-label="Delete user"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

