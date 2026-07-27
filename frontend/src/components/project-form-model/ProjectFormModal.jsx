import React, { useEffect, useState } from 'react';
import Card from '../card/Card';
import Button from '../button/Button';
import TextField from '../text-field/TextField';

/**
 * Create/edit form for a project. Pass `project` to edit, omit it to create.
 * organizationId is required for create (comes from the page's selected org).
 */
export default function ProjectFormModal({ open, organizationId, project, onClose, onSubmit, submitting, error }) {
  const isEditing = Boolean(project);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (open) {
      setName(project?.name || '');
      setDescription(project?.description || '');
      setStartDate(project?.startDate || '');
      setEndDate(project?.endDate || '');
      setNameError('');
    }
  }, [open, project]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError('');

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    if (isEditing) {
      onSubmit(payload);
    } else {
      onSubmit({ organizationId, ...payload });
    }
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
      <div style={{ width: '100%', maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <Card title={isEditing ? 'Edit project' : 'New project'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <TextField
              label="Name"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              disabled={submitting}
            />

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
                style={{
                  padding: '0.8rem 0.95rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--muted)',
                  outline: 'none',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </label>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={submitting}
              />
              <TextField
                label="End date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={submitting}
              />
            </div>

            {error && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</span>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="white" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create project'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
