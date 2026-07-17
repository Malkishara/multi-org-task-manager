import React from 'react';

export default function TextField({ label, error, ...props }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      {label && <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--white)' }}>{label}</span>}
      <input
        {...props}
        style={{
          padding: '0.8rem 0.95rem',
          borderRadius: '0.75rem',
          border: error ? '1px solid var(--danger)' : '1px solid var(--muted)',
          outline: 'none',
          fontSize: '1rem',
        }}
      />
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</span>}
    </label>
  );
}
