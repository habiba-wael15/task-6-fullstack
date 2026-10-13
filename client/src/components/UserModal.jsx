import React, { useState, useEffect } from 'react';
import { CloseIcon, AlertCircleIcon } from './Icons';

export function UserModal({ isOpen, onClose, onSubmit, initialUser = null, isSubmitting = false }) {
  const isEdit = Boolean(initialUser);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.Name || '',
        email: initialUser.Email || '',
        age: initialUser.Age !== undefined ? String(initialUser.Age) : ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        age: ''
      });
    }
    setErrors({});
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!formData.age || String(formData.age).trim() === '') {
      newErrors.age = 'Age is required.';
    } else {
      const numAge = Number(formData.age);
      if (!Number.isInteger(numAge)) {
        newErrors.age = 'Age must be a whole number.';
      } else if (numAge < 1 || numAge > 120) {
        newErrors.age = 'Age must be between 1 and 120.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      age: parseInt(formData.age, 10)
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit User Profile' : 'Add New User'}</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close modal">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="user-name-input" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="user-name-input"
                type="text"
                className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Sarah Chen"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                autoFocus
              />
              {errors.name ? (
                <div className="form-error-msg">
                  <AlertCircleIcon className="w-4 h-4" />
                  <span>{errors.name}</span>
                </div>
              ) : (
                <div className="form-hint">Must be between 2 and 100 characters.</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="user-email-input" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="user-email-input"
                type="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="e.g. sarah.chen@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email ? (
                <div className="form-error-msg">
                  <AlertCircleIcon className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              ) : (
                <div className="form-hint">Must be unique across all registered accounts.</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="user-age-input" className="form-label">
                Age <span className="required">*</span>
              </label>
              <input
                id="user-age-input"
                type="number"
                min="1"
                max="120"
                step="1"
                className={`form-input ${errors.age ? 'is-invalid' : ''}`}
                placeholder="e.g. 28"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
              />
              {errors.age ? (
                <div className="form-error-msg">
                  <AlertCircleIcon className="w-4 h-4" />
                  <span>{errors.age}</span>
                </div>
              ) : (
                <div className="form-hint">Must be a valid integer between 1 and 120.</div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Profile' : 'Save User'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

