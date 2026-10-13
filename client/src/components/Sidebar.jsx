import React from 'react';
import { UsersIcon, DatabaseIcon, ChartBarIcon } from './Icons';

export function Sidebar({ activeTab, onTabChange, dbHealth }) {
  const isConnected = dbHealth?.database?.status === 'connected';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <UsersIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="brand-title">Saiket Systems</div>
          <span className="brand-badge">TASK 6 &bull; FULL STACK</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => onTabChange('users')}
        >
          <UsersIcon className="w-5 h-5" />
          <span>User Management</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
        >
          <ChartBarIcon className="w-5 h-5" />
          <span>Overview & Stats</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="db-status-badge">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap' }}>
              MS SQL Server
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {isConnected ? dbHealth.database.database : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

