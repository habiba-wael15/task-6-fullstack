import React from 'react';
import { UsersIcon, ChartBarIcon, CalendarIcon, DatabaseIcon } from './Icons';

export function StatsCards({ stats, usersCount, dbHealth }) {
  const total = stats?.totalUsers !== undefined ? stats.totalUsers : usersCount;
  const avgAge = stats?.averageAge !== undefined ? stats.averageAge : 0;
  const minAge = stats?.minAge !== undefined ? stats.minAge : 0;
  const maxAge = stats?.maxAge !== undefined ? stats.maxAge : 0;
  const isConnected = dbHealth?.database?.status === 'connected';

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">Total Registered Users</div>
          <div className="stat-value">{total}</div>
          <div className="stat-desc">Live from SaiketTask6DB</div>
        </div>
        <div className="stat-icon-wrapper indigo">
          <UsersIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">Average User Age</div>
          <div className="stat-value">{avgAge > 0 ? `${avgAge} yrs` : 'N/A'}</div>
          <div className="stat-desc">Calculated across user profiles</div>
        </div>
        <div className="stat-icon-wrapper purple">
          <ChartBarIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">Age Distribution</div>
          <div className="stat-value">
            {minAge > 0 ? `${minAge} - ${maxAge}` : 'N/A'}
          </div>
          <div className="stat-desc">{minAge > 0 ? 'Min to max user age' : 'No records registered'}</div>
        </div>
        <div className="stat-icon-wrapper slate">
          <CalendarIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-label">Database Health</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: isConnected ? '#10b981' : '#ef4444' }}>
            {isConnected ? 'Connected' : 'Offline'}
          </div>
          <div className="stat-desc">
            {isConnected ? `${dbHealth.database.database} (Windows SSPI)` : 'Check SQL Server'}
          </div>
        </div>
        <div className="stat-icon-wrapper green">
          <DatabaseIcon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

