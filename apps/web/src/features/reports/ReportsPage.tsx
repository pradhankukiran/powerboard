import { useEffect } from "react";
import { EmbedFrame } from "../../components/layout/EmbedFrame";
import { useGetSupersetTokenMutation } from "./reportsApi";

const SUPERSET_URL = import.meta.env.VITE_SUPERSET_URL || "http://localhost:8088";
const DASHBOARD_UUID = import.meta.env.VITE_SUPERSET_DASHBOARD_UUID || "260fa443-c6e8-4ea4-ba57-bc4f0140157c";

export function ReportsPage() {
  const [getSupersetToken, { data, isLoading, isError }] = useGetSupersetTokenMutation();

  useEffect(() => {
    getSupersetToken({ dashboardId: DASHBOARD_UUID });
  }, []);

  const embedUrl = data?.token
    ? `${SUPERSET_URL}/embedded/${DASHBOARD_UUID}?guest_token=${data.token}`
    : null;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Reports</h1>
      {isLoading && (
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-sm text-gray-400">Loading Superset dashboard...</p>
        </div>
      )}
      {isError && (
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-sm text-red-500">
            Failed to load Superset embed token. Check that the API is running.
          </p>
        </div>
      )}
      {embedUrl && (
        <EmbedFrame src={embedUrl} title="Superset Reports" />
      )}
    </div>
  );
}
