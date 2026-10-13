import React from 'react';
import { UserPlusIcon, RefreshIcon } from './Icons';

export function Header({ onAddUser, onRefresh, isRefreshing, dbHealth }) {
  const isConnected = dbHealth?.database?.status === 'connected';

  return (
    <header className="top-header">
      <div className="header-title-block">
        <h1>User Management Dashboard</h1>
        <p>Saiket Systems Full Stack Application with Microsoft SQL Server Persistence</p>
      </div>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', padding: '6px 12px', background: isConnected ? '#ecfdf5' : '#fef2f2', borderRadius: '8px', color: isConnected ? '#065f46' : '#991b1b', fontWeight: 600 }}>
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Database Online' : 'Database Offline'}</span>
        </div>

        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data from SQL Server"
        >
          <RefreshIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>

        <button
          className="btn btn-primary"
          onClick={onAddUser}
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>
    </header>
  );
}

