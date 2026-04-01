import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "technician" | "viewer";
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("pb_token"),
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: User }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("pb_token", action.payload.token);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("pb_token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
