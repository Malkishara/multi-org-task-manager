import React from 'react';
import Button from '../button/Button';

/**
 * Generic confirmation modal.
 *
 * <ConfirmModal
 *   open={confirmState.open}
 *   title="Delete organization"
 *   message={`Delete "${org.name}"? This can't be undone.`}
 *   confirmLabel="Delete"
 *   confirmVariant="danger"
 *   onConfirm={() => dispatch(deleteOrganization(org.id))}
 *   onClose={() => setConfirmState({ open: false })}
 * />
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onClose,
  loading = false,
}) {
  if (!open) return null;

  const handleConfirm = () => {
    if (loading) return;
    onConfirm();
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
        zIndex: 1100,
        padding: '1rem',
      }}
      onClick={loading ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--navy-light)',
          borderRadius: '1.25rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        }}
      >
        <h3 style={{ margin: 0, color: 'var(--white)' }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="white" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={confirmVariant} onClick={handleConfirm} disabled={loading}>
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
