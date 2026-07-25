// Redux store configuration with slices for auth and UI state management

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import organizationReducer from './slices/organizationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    organizations: organizationReducer, 
  },
});

export default store;
