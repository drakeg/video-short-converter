"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { fetchProfile, getCurrentUser, saveProfile } from "@/lib/auth";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [youtubeChannel, setYoutubeChannel] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    // Email comes from browser-backed auth state and is hydrated after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(String(user?.email || ""));
    fetchProfile()
      .then((profile) => {
        setDisplayName(profile.display_name || profile.displayName || "");
        setYoutubeChannel(profile.youtube_channel || "");
      })
      .catch((err) => setStatus(`Could not load profile yet: ${err instanceof Error ? err.message : String(err)}`));
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("Saving...");
    try {
      await saveProfile({ display_name: displayName, youtube_channel: youtubeChannel });
      setStatus("Profile saved.");
    } catch (err) {
      setStatus(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-gray-900 dark:from-slate-950 dark:to-slate-900 dark:text-gray-100">
      <RequireAuth>
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-lg dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Profile</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-300">Back to app</Link>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input value={email} disabled className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Display name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">YouTube channel</label>
              <input value={youtubeChannel} onChange={(e) => setYoutubeChannel(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="https://www.youtube.com/@MadMallardsAdventures" />
            </div>
            <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Save profile</button>
            {status && <p className="text-sm text-gray-600 dark:text-gray-300">{status}</p>}
          </form>
        </div>
      </RequireAuth>
    </main>
  );
}
