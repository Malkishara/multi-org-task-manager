/**
 * AppRoutes Component
 * Centralized route management for the application
 * Handles all routes with proper layouts and role-based access
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/landing-page/LandingPage';
import AuthPage from './pages/auth-page/AuthPage';
import Organization from './pages/organization/Organization';
import OrganizationMembersPage from './pages/organization-member-page/OrganizationMembersPage';
import ProjectsPage from './pages/project-page/ProjectsPage';
import ProfilePage from './pages/profile-page/ProfilePage';
import TasksPage from './pages/tasks-page/TasksPage';
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
 {/* Layout wraps every route below so the Navbar shows on public and
          protected pages alike. */}
      <Route element={<Layout />}>
        {/* Organization - Main protected area */}
        <Route
          path="/organization"
          element={
            <ProtectedRoute>
              <Organization />
            </ProtectedRoute>
          }
        />

        {/* Users - organization members management (select org, view/add users) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <OrganizationMembersPage />
            </ProtectedRoute>
          }
        />

        {/* Projects - organization projects management (select org, view/add/edit projects) */}
                {/* NOTE: menuConfig currently points ADMIN/LEAD at "/organization/projects" -
                    if you want that nested path instead of this top-level one, change
                    it here AND update menuConfig.js to match. */}
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
                    </ProtectedRoute>
                  }
                />

                 {/* Tasks - tasks for a single project, reached by clicking a project name */}
        <Route
          path="/projects/:projectId/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

                {/* Profile */}

                 <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

        {/* ===== ERROR ROUTES ===== */}

        {/* 404 - Page Not Found */}
        <Route path="/not-found" element={<NotFoundPage />} />

        {/* Catch-all wildcard route - redirect to 404 */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;