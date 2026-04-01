import { StatCard } from "../../components/ui/StatCard";
import { cn } from "../../lib/cn";
import { useGetTicketStatsQuery, useGetDeviceStatsQuery, useGetAlertStatsQuery, useGetSlaSummaryQuery } from "./dashboardApi";
import { useGetRecentTicketsQuery } from "./ticketsApi";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-600",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-400",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-600",
  warning: "bg-orange-500",
  info: "bg-blue-400",
};

const STATUS_STYLES: Record<string, string> = {
  open: "text-blue-600",
  in_progress: "text-yellow-600",
  resolved: "text-green-600",
  closed: "text-gray-400",
};

function PriorityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-16 text-xs text-gray-500 capitalize">{label}</span>
      <div className="flex-1 bg-gray-100 h-5">
        <div className={cn(color, "h-full")} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs text-gray-600">{count}</span>
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DashboardPage() {
  const { data: ticketStats, isLoading: ticketsLoading } = useGetTicketStatsQuery();
  const { data: deviceStats, isLoading: devicesLoading } = useGetDeviceStatsQuery();
  const { data: alertStats, isLoading: alertsLoading } = useGetAlertStatsQuery();
  const { data: slaSummary, isLoading: slaLoading } = useGetSlaSummaryQuery();
  const { data: recentTickets, isLoading: ticketsListLoading } = useGetRecentTicketsQuery();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Row 1: Top-level stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Open Tickets"
          value={ticketsLoading ? "\u2014" : ticketStats?.open ?? 0}
          sub={ticketsLoading ? undefined : `${ticketStats?.total ?? 0} total`}
        />
        <StatCard
          label="Devices Online"
          value={devicesLoading ? "\u2014" : deviceStats?.online ?? 0}
          sub={devicesLoading ? undefined : `${deviceStats?.total ?? 0} total`}
        />
        <StatCard
          label="Active Alerts"
          value={alertsLoading ? "\u2014" : alertStats?.active ?? 0}
          sub={alertsLoading ? undefined : `${alertStats?.acknowledged ?? 0} acknowledged`}
        />
        <StatCard
          label="SLA Uptime"
          value={slaLoading ? "\u2014" : `${slaSummary?.averageUptime ?? 0}%`}
          sub={slaLoading ? undefined : `${slaSummary?.complianceRate ?? 0}% compliance`}
        />
      </div>

      {/* Row 2: Priority & Severity breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Tickets by Priority</p>
          {ticketsLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-2">
              {(["critical", "high", "medium", "low"] as const).map((p) => (
                <PriorityBar
                  key={p}
                  label={p}
                  count={ticketStats?.byPriority[p] ?? 0}
                  total={ticketStats?.total ?? 1}
                  color={PRIORITY_COLORS[p]}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Alerts by Severity</p>
          {alertsLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-2">
              {(["critical", "warning", "info"] as const).map((s) => (
                <PriorityBar
                  key={s}
                  label={s}
                  count={alertStats?.bySeverity[s] ?? 0}
                  total={alertStats?.total ?? 1}
                  color={SEVERITY_COLORS[s]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Recent tickets table */}
      <div className="bg-white border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Tickets</p>
        </div>
        {ticketsListLoading ? (
          <div className="p-5">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : !recentTickets?.tickets?.length ? (
          <div className="p-5">
            <p className="text-sm text-gray-400">No tickets found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assignee</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-100">
                  <td className="px-5 py-3 text-gray-900">{ticket.subject}</td>
                  <td className={cn("px-5 py-3", STATUS_STYLES[ticket.status] ?? "text-gray-600")}>
                    {formatStatus(ticket.status)}
                  </td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{ticket.priority}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {ticket.assignedTo
                      ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                      : "\u2014"}
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
