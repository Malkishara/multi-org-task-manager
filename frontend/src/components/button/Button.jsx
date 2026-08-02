import React from 'react';

const variants = {
  primary: { background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--blue)' },
  danger: { background: 'var(--danger)', color: 'var(--white)', border: '1px solid var(--danger)' },
  success: { background: 'var(--success)', color: 'var(--white)', border: '1px solid var(--success)' },
  white: { background: 'var(--white)', color: 'var(--text)', border: '1px solid var(--blue)' },
};

export default function Button({ variant = 'primary', children, icon, className = '', ...props }) {
  const style = variants[variant] || variants.primary;
  return (
    <button
      className={`tf-btn ${className}`.trim()}
      style={{
        ...style,
        padding: '0.8rem 1rem',
        borderRadius: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
