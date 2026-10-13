import React from 'react';
import { CloseIcon, EditIcon, MailIcon, CalendarIcon } from './Icons';

function formatFullDate(dateString) {
  if (!dateString) return 'Never updated';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (_e) {
    return dateString;
  }
}

export function UserDetailsModal({ isOpen, onClose, user, onEdit }) {
  if (!isOpen || !user) return null;

  const initial = (user.Name || 'U').charAt(0).toUpperCase();

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Profile Details</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close modal">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-profile-header">
            <div
              className="details-avatar-lg"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              }}
            >
              {initial}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {user.Name}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <span className="user-id-badge">ID #{user.Id}</span>
                <span className="age-badge">{user.Age} years old</span>
              </div>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-label">Email Address</div>
              <div className="detail-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                {user.Email}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Age</div>
              <div className="detail-val">{user.Age} years old</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Account Created</div>
              <div className="detail-val">{formatFullDate(user.CreatedAt)}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Last Updated</div>
              <div className="detail-val">{user.UpdatedAt ? formatFullDate(user.UpdatedAt) : 'Never modified'}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(user);
            }}
          >
            <EditIcon className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

