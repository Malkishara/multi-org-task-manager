import React from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../navbar/Navbar';
import { logout as logoutAction } from '../../redux/slices/authSlice';

/**
 * Shared shell rendered for every route (public and protected). Keeps the
 * Navbar visible everywhere instead of each protected page embedding its
 * own copy. Individual pages (Organization, OrganizationMembersPage, etc.)
 * should NOT render <Navbar> themselves anymore - just their content.
 */
export default function Layout() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}