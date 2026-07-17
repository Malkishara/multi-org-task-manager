import React from 'react';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';

export default function Dashboard({ user, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '2rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#0F172A' }}>Welcome back, {user?.name || 'there'}.</h1>
            <p style={{ margin: '0.3rem 0 0', color: '#64748B' }}>Your multi-organization workspace is ready.</p>
          </div>
          <Button variant="white" onClick={onLogout}>Log out</Button>
        </div>
        <Card title="Organizations" subtitle="One account can belong to many organizations.">
          <p style={{ margin: 0, color: '#475569' }}>Your role is {user?.role || 'MEMBER'} and you can manage shared workspaces from here.</p>
        </Card>
      </div>
    </div>
  );
}
