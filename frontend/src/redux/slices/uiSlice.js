// UI slice for managing UI state like modals, notifications, loading states

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  notification: null,
  modal: null,
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    showNotification: (state, action) => {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type || 'info', // 'success', 'error', 'warning', 'info'
        duration: action.payload.duration || 3000,
      };
    },
    hideNotification: (state) => {
      state.notification = null;
    },
    openModal: (state, action) => {
      state.modal = {
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = null;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setLoading, showNotification, hideNotification, openModal, closeModal, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
