// Auth slice for managing authentication state

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: localStorage.getItem('taskflow_user') ? JSON.parse(localStorage.getItem('taskflow_user')) : null,
  token: localStorage.getItem('taskflow_token') || null,
  isAuthenticated: !!localStorage.getItem('taskflow_token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = null;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('taskflow_user', JSON.stringify(action.payload.user));
      localStorage.setItem('taskflow_token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('taskflow_user');
      localStorage.removeItem('taskflow_token');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('taskflow_user', JSON.stringify(action.payload));
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
