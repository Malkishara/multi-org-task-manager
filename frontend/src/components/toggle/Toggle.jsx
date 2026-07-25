import React from 'react';

/**
 * Simple accessible toggle switch.
 * onChange receives the NEW boolean value.
 */
export default function Toggle({ checked, onChange, disabled = false, labelOn = 'Active', labelOff = 'Inactive' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        padding: 0,
      }}
    >
      <span
        style={{
          width: '2.6rem',
          height: '1.4rem',
          borderRadius: '999px',
          background: checked ? 'var(--success)' : 'var(--muted)',
          position: 'relative',
          transition: 'background 0.2s ease',
          display: 'inline-block',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '0.15rem',
            left: checked ? '1.35rem' : '0.15rem',
            width: '1.1rem',
            height: '1.1rem',
            borderRadius: '50%',
            background: 'var(--white)',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        />
      </span>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: checked ? 'var(--success)' : 'var(--muted)' }}>
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}
