"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center space-y-6">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
        <span className="text-2xl font-bold text-red-400">!</span>
      </div>
      <h2 className="text-xl font-bold">Dashboard Error</h2>
      <p className="text-white/50 text-sm max-w-md">{error.message || "Failed to load dashboard data."}</p>
      <button
        onClick={reset}
        className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold transition-all text-sm"
      >
        Reload
      </button>
    </div>
  );
}
