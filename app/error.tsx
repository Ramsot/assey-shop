"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details safely (no PII) in production
    console.error(
      JSON.stringify({
        event: "RSC_RENDER_ERROR",
        digest: error.digest || "no-digest",
        message: error.message,
        // Intentionally NOT logging error.stack to avoid leaking
        // internal paths in production logs
        timestamp: new Date().toISOString(),
      })
    );
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl font-bold text-red-400">!</span>
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-white/50 text-sm">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-[10px] text-white/20 font-mono">
            Reference: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
