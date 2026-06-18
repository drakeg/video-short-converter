"use client";

import { login } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg dark:bg-slate-900 dark:text-gray-100">
        <h1 className="mb-3 text-3xl font-bold">Video Shorts Converter</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Sign in or create an account to continue.</p>
        <button onClick={() => void login()} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
          Sign in / create account
        </button>
      </div>
    </main>
  );
}
