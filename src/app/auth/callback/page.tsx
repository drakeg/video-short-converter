"use client";

import { useEffect, useState } from "react";
import { AUTH_START_PARAM, handleAuthCallback, login } from "@/lib/auth";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Finishing sign-in...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const startingOnConfiguredOrigin = params.get(AUTH_START_PARAM) === "1";
    if (startingOnConfiguredOrigin) {
      setMessage("Starting secure sign-in...");
      login().catch((err) => setError(err instanceof Error ? err.message : String(err)));
      return;
    }

    handleAuthCallback()
      .then(() => window.location.replace("/"))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg dark:bg-slate-900 dark:text-gray-100">
        {error ? (
          <>
            <h1 className="mb-3 text-2xl font-bold text-red-600">Sign-in failed</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
          </>
        ) : (
          <>
            <h1 className="mb-3 text-2xl font-bold">{message}</h1>
            <p className="text-gray-600 dark:text-gray-300">You’ll be redirected shortly.</p>
          </>
        )}
      </div>
    </main>
  );
}
