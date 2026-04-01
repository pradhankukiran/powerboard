import { EmbedFrame } from "../../components/layout/EmbedFrame";
import { useGetGrafanaUrlQuery } from "./monitoringApi";

export function MonitoringPage() {
  const { data, isLoading, isError } = useGetGrafanaUrlQuery();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Monitoring</h1>
      {isLoading && (
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-sm text-gray-400">Loading Grafana URL...</p>
        </div>
      )}
      {isError && (
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-sm text-red-500">
            Failed to load Grafana configuration. Check that the API is running.
          </p>
        </div>
      )}
      {data?.url && (
        <EmbedFrame
          src={`${data.url}/d/monitoring/powerboard-monitoring?orgId=1&kiosk=tv`}
          title="Grafana Monitoring"
        />
      )}
    </div>
  );
}
