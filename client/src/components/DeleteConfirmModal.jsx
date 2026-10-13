import React from 'react';
import { AlertCircleIcon, CloseIcon } from './Icons';

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, user, isDeleting = false }) {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--danger)', display: 'flex' }}>
              <AlertCircleIcon className="w-6 h-6" />
            </div>
            <h2 style={{ fontSize: '1.15rem' }}>Confirm User Deletion</h2>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close modal">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '14px' }}>
            Are you sure you want to permanently delete the profile for{' '}
            <strong style={{ color: 'var(--text-main)' }}>{user.Name}</strong> (ID #{user.Id})?
          </p>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', color: '#991b1b' }}>
            Warning: This will remove the record directly from <strong>SaiketTask6DB.dbo.Users</strong>. This action cannot be reversed.
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(user.Id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="spinner"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete User</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

