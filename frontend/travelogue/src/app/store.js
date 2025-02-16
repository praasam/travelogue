import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import navbarReducer from '../features/navbar/navbarSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    navbar: navbarReducer,
  },
});