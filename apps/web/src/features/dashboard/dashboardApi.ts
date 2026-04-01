import { apiSlice } from "../../app/api";

interface TicketStats {
  total: number;
  open: number;
  byPriority: Record<string, number>;
}

interface DeviceStats {
  total: number;
  online: number;
}

interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  bySeverity: Record<string, number>;
}

interface SlaSummary {
  averageUptime: number;
  complianceRate: number;
}

function arrayToMap(arr: { count: string }[], key: string): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of arr) {
    map[(item as Record<string, string>)[key]] = parseInt(item.count, 10);
  }
  return map;
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTicketStats: builder.query<TicketStats, void>({
      query: () => "/tickets/stats",
      transformResponse: (raw: {
        data: {
          byStatus: { status: string; count: string }[];
          byPriority: { priority: string; count: string }[];
          total: number;
        };
      }) => {
        const statusMap = arrayToMap(raw.data.byStatus, "status");
        return {
          total: raw.data.total,
          open: (statusMap["open"] ?? 0) + (statusMap["in_progress"] ?? 0) + (statusMap["escalated"] ?? 0),
          byPriority: arrayToMap(raw.data.byPriority, "priority"),
        };
      },
      providesTags: ["Tickets"],
    }),
    getDeviceStats: builder.query<DeviceStats, void>({
      query: () => "/devices/stats",
      transformResponse: (raw: {
        data: {
          byStatus: { status: string; count: string }[];
          total: number;
        };
      }) => {
        const statusMap = arrayToMap(raw.data.byStatus, "status");
        return {
          total: raw.data.total,
          online: statusMap["online"] ?? 0,
        };
      },
      providesTags: ["Devices"],
    }),
    getAlertStats: builder.query<AlertStats, void>({
      query: () => "/alerts/stats",
      transformResponse: (raw: {
        data: {
          bySeverity: { severity: string; count: string }[];
          unacknowledgedCount: number;
          total: number;
        };
      }) => ({
        total: raw.data.total,
        active: raw.data.unacknowledgedCount ?? 0,
        acknowledged: raw.data.total - (raw.data.unacknowledgedCount ?? 0),
        bySeverity: arrayToMap(raw.data.bySeverity, "severity"),
      }),
      providesTags: ["Alerts"],
    }),
    getSlaSummary: builder.query<SlaSummary, void>({
      query: () => "/sla/summary",
      transformResponse: (raw: {
        data: {
          avgUptime: string;
          avgResponseMinutes: string;
          avgResolutionMinutes: string;
          totalBreaches: string;
        };
      }) => ({
        averageUptime: parseFloat(raw.data.avgUptime ?? "0"),
        complianceRate: Math.min(100, parseFloat(raw.data.avgUptime ?? "0")),
      }),
      providesTags: ["SLA"],
    }),
  }),
});

export const {
  useGetTicketStatsQuery,
  useGetDeviceStatsQuery,
  useGetAlertStatsQuery,
  useGetSlaSummaryQuery,
} = dashboardApi;
