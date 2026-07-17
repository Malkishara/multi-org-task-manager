import React from 'react';

export default function Card({ children, title, subtitle, actions }) {
  return (
    <section style={{ background: '#FFFFFF', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)', border: '1px solid #E2E8F0' }}>
      {(title || subtitle || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            {title && <h3 style={{ margin: 0, color: '#0F172A' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '0.25rem 0 0', color: '#64748B' }}>{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
