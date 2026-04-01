import { apiSlice } from "../../app/api";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  assignedTo?: {
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
}

interface TicketsResponse {
  tickets: Ticket[];
}

export const ticketsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecentTickets: builder.query<TicketsResponse, void>({
      query: () => "/tickets?limit=10&page=1",
      transformResponse: (raw: { data: Ticket[] }) => ({
        tickets: raw.data,
      }),
      providesTags: ["Tickets"],
    }),
  }),
});

export const { useGetRecentTicketsQuery } = ticketsApi;
