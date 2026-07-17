import React from 'react';

export default function IconButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '999px',
        border: '1px solid #CBD5E1',
        background: '#FFFFFF',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}
