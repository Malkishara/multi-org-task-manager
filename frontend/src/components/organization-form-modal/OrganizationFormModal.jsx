import React, { useEffect, useState } from 'react';
import Button from '../button/Button';
import TextField from '../text-field/TextField';

const emptyForm = { name: '', description: '', logoUrl: '' };

/**
 * organization = null  -> create mode
 * organization = {...} -> edit mode (pre-fills the form)
 */
export default function OrganizationFormModal({ open, organization, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name || '',
        description: organization.description || '',
        logoUrl: organization.logoUrl || '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [organization, open]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Organization name is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
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
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: 'var(--navy-light)',
          borderRadius: '1.25rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        }}
      >
        <h3 style={{ margin: 0, color: 'var(--white)' }}>
          {organization ? 'Edit organization' : 'Create organization'}
        </h3>

        <TextField
          label="Name"
          value={form.name}
          onChange={handleChange('name')}
          error={errors.name}
          placeholder="Organization Name"
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={handleChange('description')}
          placeholder="What does this organization do?"
        />
        <TextField
          label="Logo URL"
          value={form.logoUrl}
          onChange={handleChange('logoUrl')}
          placeholder="https://..."
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="white" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving…' : organization ? 'Save changes' : 'Create organization'}
          </Button>
        </div>
      </form>
    </div>
  );
}
