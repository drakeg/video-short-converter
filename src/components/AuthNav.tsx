"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_CHANGED_EVENT, getCurrentUser, login, logout, refreshSession, type JwtPayload } from "@/lib/auth";

export default function AuthNav() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const sync = () => { if (active) setUser(getCurrentUser()); };
    const restore = async () => { sync(); if (!getCurrentUser()) { await refreshSession(); sync(); } };
    void restore();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { active = false; window.removeEventListener(AUTH_CHANGED_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  return (
    <div className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100">
      {error && <span className="max-w-64 truncate text-red-600" title={error}>{error}</span>}
      {user ? <><span className="hidden max-w-48 truncate sm:inline">{user.email || user.name || "Signed in"}</span><Link href="/profile/" className="text-blue-600 hover:text-blue-800 dark:text-blue-300">Profile</Link><button onClick={() => { try { logout(); } catch (authError) { setError(authError instanceof Error ? authError.message : "Unable to sign out."); } }} className="text-blue-600 hover:text-blue-800 dark:text-blue-300">Sign out</button></> : <button onClick={() => void login().catch((authError) => setError(authError instanceof Error ? authError.message : "Unable to start sign-in."))} className="text-blue-600 hover:text-blue-800 dark:text-blue-300">Sign in</button>}
    </div>
  );
}
