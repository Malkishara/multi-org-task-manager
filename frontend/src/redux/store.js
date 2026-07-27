// Redux store configuration with slices for auth and UI state management

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import organizationReducer from './slices/organizationSlice';
import memberReducer from './slices/Memberslice';
import projectsReducer from './slices/projectSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    organizations: organizationReducer, 
      members: memberReducer,
      projects: projectsReducer,
      profile: profileReducer
  },
});

export default store;
