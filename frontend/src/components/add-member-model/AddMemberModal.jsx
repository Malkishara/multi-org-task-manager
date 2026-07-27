import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../card/Card';
import Button from '../button/Button';
import TextField from '../text-field/TextField';
import { addMember, clearAddError } from '../../redux/slices/Memberslice';

const ROLE_OPTIONS = ['ADMIN', 'MEMBER'];

export default function AddMemberModal({ organizationId, onClose }) {
  const dispatch = useDispatch();
  const { addStatus, addError } = useSelector((state) => state.members);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [fieldError, setFieldError] = useState('');

  const isSubmitting = addStatus === 'loading';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setFieldError('Email is required');
      return;
    }
    setFieldError('');

    const result = await dispatch(addMember({ organizationId, email: email.trim(), role }));
    if (addMember.fulfilled.match(result)) {
      onClose();
    }
  };

  const handleClose = () => {
    dispatch(clearAddError());
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
      }}
      onClick={handleClose}
    >
      <div style={{ width: '100%', maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <Card title="Add user to organization">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <TextField
              label="Email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldError}
              disabled={isSubmitting}
            />

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting}
                style={{
                  padding: '0.8rem 0.95rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--muted)',
                  outline: 'none',
                  fontSize: '1rem',
                }}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {addError && (
              <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{addError}</span>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="white" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add user'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
