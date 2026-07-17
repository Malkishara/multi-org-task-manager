/**
 * AppRoutes Component
 * Centralized route management for the application
 * Handles all routes with proper layouts and role-based access
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landing-page/LandingPage';
import AuthPage from './pages/auth-page/AuthPage';
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}

      {/* Landing Page - Home */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes - Login and Register */}
      <Route path="/auth/login" element={<AuthPage mode="login" />} />
      <Route path="/auth/signup" element={<AuthPage mode="signup" />} />

      {/* ===== PROTECTED ROUTES ===== */}

      {/* Dashboard - Main protected area */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ===== ERROR ROUTES ===== */}

      {/* 404 - Page Not Found */}
      <Route path="/not-found" element={<NotFoundPage />} />

      {/* Catch-all wildcard route - redirect to 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
