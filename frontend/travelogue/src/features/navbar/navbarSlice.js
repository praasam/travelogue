import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
};

const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    toggle(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { toggle } = navbarSlice.actions;
export default navbarSlice.reducer;