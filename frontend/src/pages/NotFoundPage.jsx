import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/button/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
      color: '#FFFFFF',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#E0E7FF' }}>Page Not Found</h2>
      <p style={{ fontSize: '1.125rem', color: '#CBD5E1', marginBottom: '2rem', maxWidth: '500px' }}>
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="primary" onClick={() => navigate('/')}>Go to Home</Button>
        <Button variant="white" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
}
