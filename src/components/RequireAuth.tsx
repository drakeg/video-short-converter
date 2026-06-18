"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, login, type JwtPayload } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null | undefined>(undefined);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (user === undefined) {
    return <div className="p-8 text-center text-gray-600 dark:text-gray-300">Checking sign-in...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Sign in required</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Sign in to use the video converter and manage your profile.
        </p>
        <button
          onClick={() => void login()}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Sign in / create account
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
