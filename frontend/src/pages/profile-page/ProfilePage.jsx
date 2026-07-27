import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import TextField from '../../components/text-field/TextField';
import {
  fetchProfile,
  updateProfile,
  clearProfileUpdateError,
} from '../../redux/slices/profileSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { data: profile, loading, error, updateStatus, updateError } = useSelector(
    (state) => state.profile
  );

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const startEditing = () => {
    setFirstName(profile?.firstName || '');
    setLastName(profile?.lastName || '');
    setFieldError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    if (updateStatus === 'loading') return;
    dispatch(clearProfileUpdateError());
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setFieldError('First and last name are required');
      return;
    }
    setFieldError('');

    const result = await dispatch(
      updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() })
    );
    if (updateProfile.fulfilled.match(result)) {
      setEditing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '560px' }}>
      <Card
        title="My profile"
        subtitle="View and update your account details."
        actions={
          !editing && profile ? (
            <Button variant="primary" onClick={startEditing}>
              Edit
            </Button>
          ) : null
        }
      >
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading profile…</p>
        ) : error ? (
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        ) : !profile ? null : editing ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <TextField
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={updateStatus === 'loading'}
              />
              <TextField
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={updateStatus === 'loading'}
              />
            </div>

            {fieldError && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{fieldError}</span>}
            {updateError && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{updateError}</span>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button type="button" variant="white" onClick={cancelEditing} disabled={updateStatus === 'loading'}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={updateStatus === 'loading'}>
                {updateStatus === 'loading' ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <ProfileRow label="First name" value={profile.firstName} />
            <ProfileRow label="Last name" value={profile.lastName} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow label="Role" value={profile.role} />
            <ProfileRow
              label="Status"
              value={
                <span style={{ color: profile.active ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                  {profile.active ? 'Active' : 'Inactive'}
                </span>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>
      <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
