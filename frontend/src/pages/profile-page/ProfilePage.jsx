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
import styles from './ProfilePage.module.scss';

function getInitials(firstName, lastName) {
  const a = (firstName || '').trim()[0] || '';
  const b = (lastName || '').trim()[0] || '';
  return (a + b).toUpperCase() || '?';
}

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
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Identity banner */}
        <div className={styles.hero}>
          <div className={styles.heroPattern} aria-hidden="true" />

          {loading ? (
            <div className={styles.heroSkeleton}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonLines}>
                <span />
                <span />
              </div>
            </div>
          ) : profile ? (
            <div className={styles.heroContent}>
              <div
                className={`${styles.avatarWrap} ${profile.active ? styles.pulsing : ''}`}
              >
                <div className={styles.avatar}>{getInitials(profile.firstName, profile.lastName)}</div>
              </div>

              <div className={styles.identity}>
                <h1 className={styles.name}>
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className={styles.email}>{profile.email}</p>

                <div className={styles.badgeRow}>
                  <span className={styles.roleBadge}>{profile.role}</span>
                  <span className={styles.statusPill}>
                    <span
                      className={`${styles.dot} ${profile.active ? styles.dotActive : styles.dotInactive}`}
                    />
                    {profile.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {!editing && (
                <Button variant="primary" onClick={startEditing} className={styles.editBtn}>
                  Edit profile
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {/* Body */}
        <div className={styles.body}>
          {error ? (
            <p className={styles.errorBanner}>{error}</p>
          ) : !profile ? null : editing ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>First name</span>
                  <TextField
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={updateStatus === 'loading'}
                  />
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Last name</span>
                  <TextField
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={updateStatus === 'loading'}
                  />
                </div>
              </div>

              {fieldError && <span className={styles.fieldError}>{fieldError}</span>}
              {updateError && <span className={styles.fieldError}>{updateError}</span>}

              <div className={styles.actions}>
                <Button type="button" variant="white" onClick={cancelEditing} disabled={updateStatus === 'loading'}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={updateStatus === 'loading'}>
                  {updateStatus === 'loading' ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          ) : (
            <dl className={styles.rowList}>
              <ProfileRow label="First name" value={profile.firstName} />
              <ProfileRow label="Last name" value={profile.lastName} />
              <ProfileRow label="Email" value={profile.email} />
              <ProfileRow label="Role" value={profile.role} mono />
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value, mono }) {
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={`${styles.rowValue} ${mono ? styles.rowValueMono : ''}`}>{value}</dd>
    </div>
  );
}