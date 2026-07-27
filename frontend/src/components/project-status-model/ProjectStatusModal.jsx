import React, { useEffect, useState } from 'react';
import Card from '../card/Card';
import Button from '../button/Button';

const STATUS_OPTIONS = ['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

export default function ProjectStatusModal({ open, project, onClose, onSubmit, submitting, error }) {
  const [status, setStatus] = useState('NOT_STARTED');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open && project) {
      setStatus(project.status || 'NOT_STARTED');
      setProgress(project.progress ?? 0);
    }
  }, [open, project]);

  if (!open || !project) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ status, progress: Number(progress) });
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
      onClick={submitting ? undefined : onClose}
    >
      <div style={{ width: '100%', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <Card title={`Update status - ${project.name}`}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={submitting}
                style={{
                  padding: '0.8rem 0.95rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--muted)',
                  outline: 'none',
                  fontSize: '1rem',
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                Progress: {progress}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                disabled={submitting}
              />
            </label>

            {error && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</span>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button type="button" variant="white" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
