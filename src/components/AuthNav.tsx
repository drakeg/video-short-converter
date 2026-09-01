"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, login, logout, type JwtPayload } from "@/lib/auth";

export default function AuthNav() {
  const [user, setUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    // Authentication is read from browser storage after mount to keep SSR deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100">
      {user ? (
        <>
          <span className="hidden max-w-48 truncate sm:inline">{user.email || user.name || "Signed in"}</span>
          <Link href="/profile/" className="text-blue-600 hover:text-blue-800 dark:text-blue-300">
            Profile
          </Link>
          <button onClick={() => logout()} className="text-blue-600 hover:text-blue-800 dark:text-blue-300">
            Sign out
          </button>
        </>
      ) : (
        <button onClick={() => void login()} className="text-blue-600 hover:text-blue-800 dark:text-blue-300">
          Sign in
        </button>
      )}
    </div>
  );
}
