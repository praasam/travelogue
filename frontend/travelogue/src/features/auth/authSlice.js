import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  userRole: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.userRole = action.payload.role;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userRole = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    setToken(state, action) {
      state.token = action.payload.token;
    },
  },
});

export const { login, logout, setToken } = authSlice.actions;
export default authSlice.reducer;