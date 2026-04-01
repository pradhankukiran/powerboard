import { apiSlice } from "../../app/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "technician" | "viewer";
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
