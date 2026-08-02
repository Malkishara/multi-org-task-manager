import React, { useEffect, useState } from 'react';
import Card from '../card/Card';
import Button from '../button/Button';
import TextField from '../text-field/TextField';

const DESCRIPTION_LIMIT = 1000;

/**
 * Create/edit form for a task. Pass `task` to edit, omit it to create.
 * projectId is required for create. `members` is the list of organization
 * members (from memberSlice) used to populate the assignee dropdown.
 */
export default function TaskFormModal({
  open,
  projectId,
  task,
  members = [],
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setAssignedToId(task?.assignedToId ? String(task.assignedToId) : '');
      setStartDate(task?.startDate || '');
      setDueDate(task?.dueDate || '');
      setTitleError('');
    }
  }, [open, task]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      assignedToId: assignedToId ? Number(assignedToId) : null,
      startDate: startDate || null,
      dueDate: dueDate || null,
    };

    if (isEditing) {
      onSubmit(payload);
    } else {
      onSubmit({ projectId, ...payload });
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
        <Card title={isEditing ? 'Edit task' : 'New task'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <TextField
              label="Title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={titleError}
              disabled={submitting}
            />

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_LIMIT))}
                disabled={submitting}
                rows={3}
                maxLength={DESCRIPTION_LIMIT}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'right' }}>
                {description.length}/{DESCRIPTION_LIMIT}
              </span>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Assignee</span>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                disabled={submitting}
                style={{
                  padding: '0.8rem 0.95rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--muted)',
                  outline: 'none',
                  fontSize: '1rem',
                }}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.userId ?? member.id}>
                    {member.userName || member.user?.name || member.userEmail || member.email}
                  </option>
                ))}
              </select>
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
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
              />
            </div>

            {error && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</span>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="white" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create task'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
