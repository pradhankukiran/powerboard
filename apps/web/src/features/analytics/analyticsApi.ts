import { apiSlice } from "../../app/api";

interface MetabaseTokenRequest {
  resourceType: string;
  resourceId: number;
}

interface MetabaseTokenResponse {
  url: string;
}

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMetabaseToken: builder.mutation<MetabaseTokenResponse, MetabaseTokenRequest>({
      query: (body) => ({
        url: "/embed/metabase-token",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetMetabaseTokenMutation } = analyticsApi;
