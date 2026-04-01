import { apiSlice } from "../../app/api";

interface SupersetTokenRequest {
  dashboardId: string;
}

interface SupersetTokenResponse {
  token: string;
}

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSupersetToken: builder.mutation<SupersetTokenResponse, SupersetTokenRequest>({
      query: (body) => ({
        url: "/embed/superset-token",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetSupersetTokenMutation } = reportsApi;
