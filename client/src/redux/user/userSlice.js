import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      const payload = { ...action.payload };
      if (payload.avatar && payload.avatar.startsWith("/uploads")) {
        payload.avatar = `http://localhost:5000${payload.avatar}`;
      }
      state.currentUser = payload;
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // <-- ADD THIS
    updateUser: (state, action) => {
      if (state.currentUser) {
        const payload = { ...action.payload };
        if (payload.avatar && payload.avatar.startsWith("/uploads")) {
          payload.avatar = `http://localhost:5000${payload.avatar}`;
        }
        state.currentUser = { ...state.currentUser, ...payload };
      }
    },

    // Optional sign out
    signOut: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { signInStart, signInSuccess, signInFailure, updateUser, signOut } =
  userSlice.actions;

export default userSlice.reducer;
