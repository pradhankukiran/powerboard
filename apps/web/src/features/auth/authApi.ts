import { apiSlice } from "../../app/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "technician" | "viewer";
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const { useGetMeQuery } = authApi;
