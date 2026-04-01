import { useEffect } from "react";
import { EmbedFrame } from "../../components/layout/EmbedFrame";
import { useGetMetabaseTokenMutation } from "./analyticsApi";

export function AnalyticsPage() {
  const [getMetabaseToken, { data, isLoading, isError }] = useGetMetabaseTokenMutation();

  useEffect(() => {
    getMetabaseToken({ resourceType: "dashboard", resourceId: 1 });
  }, []);

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h1>
      {isLoading && (
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-sm text-gray-400">Loading Metabase dashboard...</p>
        </div>
      )}
      {isError && (
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-sm text-red-500">
            Failed to load Metabase embed token. Check that the API is running.
          </p>
        </div>
      )}
      {data?.url && (
        <EmbedFrame
          src={data.url}
          title="Metabase Analytics"
        />
      )}
    </div>
  );
}
