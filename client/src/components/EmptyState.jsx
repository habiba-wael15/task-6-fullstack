import React from 'react';
import { UsersIcon, UserPlusIcon, SearchIcon } from './Icons';

export function EmptyState({ isSearch = false, searchTerm = '', onAddUser, onClearSearch }) {
  if (isSearch) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrap">
          <SearchIcon className="w-8 h-8" />
        </div>
        <div className="empty-title">No matching users found</div>
        <div className="empty-desc">
          No user profiles matched your search for "<strong>{searchTerm}</strong>". Try a different name or email address.
        </div>
        <button className="btn btn-secondary" onClick={onClearSearch}>
          Clear Search Filter
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <UsersIcon className="w-8 h-8" />
      </div>
      <div className="empty-title">No users registered yet</div>
      <div className="empty-desc">
        Your SQL Server database currently has no records in table <strong>dbo.Users</strong>. Get started by adding your first user!
      </div>
      <button className="btn btn-primary" onClick={onAddUser}>
        <UserPlusIcon className="w-5 h-5" />
        <span>Add First User</span>
      </button>
    </div>
  );
}

