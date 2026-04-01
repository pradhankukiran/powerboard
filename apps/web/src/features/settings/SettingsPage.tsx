import { useState, useEffect } from "react";
import { useAppSelector } from "../../app/hooks";
import { cn } from "../../lib/cn";

interface ServiceStatus {
  name: string;
  url: string;
  status: "checking" | "online" | "offline";
}

export function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API Server", url: `${import.meta.env.VITE_API_URL || ""}/api/v1/health`, status: "checking" },
  ]);

  useEffect(() => {
    async function checkServices() {
      const updated = await Promise.all(
        services.map(async (svc) => {
          try {
            const res = await fetch(svc.url, { method: "GET" });
            return { ...svc, status: res.ok ? "online" : "offline" } as ServiceStatus;
          } catch {
            return { ...svc, status: "offline" } as ServiceStatus;
          }
        }),
      );
      setServices(updated);
    }
    checkServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Settings</h1>

      {/* User Info */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">User Information</p>
        {user ? (
          <div className="space-y-3">
            <div className="flex gap-2 text-sm">
              <span className="text-gray-500 w-20">Name</span>
              <span className="text-gray-900">{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-gray-500 w-20">Email</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-gray-500 w-20">Role</span>
              <span className="text-gray-900 capitalize">{user.role}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">User information not available. Try refreshing the page.</p>
        )}
      </div>

      {/* Service Status */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Service Status</p>
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "w-2 h-2",
                  svc.status === "online" && "bg-green-500",
                  svc.status === "offline" && "bg-red-500",
                  svc.status === "checking" && "bg-yellow-400",
                )}
              />
              <span className="text-gray-900">{svc.name}</span>
              <span className="text-gray-400 capitalize">{svc.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BI Tool URLs */}
      <div className="bg-white border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">BI Tool Configuration</p>
        <div className="space-y-3">
          <div className="flex gap-2 text-sm">
            <span className="text-gray-500 w-24">Grafana</span>
            <span className="text-gray-600">Configured via API (/embed/grafana-url)</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-gray-500 w-24">Metabase</span>
            <span className="text-gray-600">Configured via API (/embed/metabase-token)</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-gray-500 w-24">Superset</span>
            <span className="text-gray-600">
              {import.meta.env.VITE_SUPERSET_URL || "http://localhost:8088"} (VITE_SUPERSET_URL)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
