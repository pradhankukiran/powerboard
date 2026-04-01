import { apiSlice } from "../../app/api";

interface GrafanaUrlResponse {
  url: string;
}

export const monitoringApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGrafanaUrl: builder.query<GrafanaUrlResponse, void>({
      query: () => "/embed/grafana-url",
    }),
  }),
});

export const { useGetGrafanaUrlQuery } = monitoringApi;
