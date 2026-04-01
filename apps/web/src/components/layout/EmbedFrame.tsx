import { useState } from "react";

interface EmbedFrameProps {
  src: string;
  title: string;
}

export function EmbedFrame({ src, title }: EmbedFrameProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-[calc(100vh-8rem)]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-sm text-gray-400">Loading {title}...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-sm text-red-500">
            Failed to load {title}. Check the service is running.
          </div>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        className="w-full h-full border-0"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}
