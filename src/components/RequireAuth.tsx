"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, login, refreshSession, type JwtPayload } from "@/lib/auth";

const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== "false";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null | undefined>(authRequired ? undefined : null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!authRequired) return;
    let active = true;
    void (async () => {
      try {
        let current = getCurrentUser();
        if (!current && await refreshSession()) current = getCurrentUser();
        if (active) setUser(current);
      } catch (error) {
        if (active) { setUser(null); setAuthError(error instanceof Error ? error.message : "Unable to check your sign-in session."); }
      }
    })();
    return () => { active = false; };
  }, []);

  if (!authRequired) return <>{children}</>;
  if (user === undefined) return <div className="p-8 text-center text-gray-600 dark:text-gray-300">Checking sign-in...</div>;
  if (!user) return (
    <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Sign in required</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">{authError ?? "Sign in to use the video converter and manage your profile."}</p>
      <button onClick={() => void login().catch((error) => setAuthError(error instanceof Error ? error.message : "Unable to start sign-in."))} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Sign in / create account</button>
    </div>
  );
  return <>{children}</>;
}
