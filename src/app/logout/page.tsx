"use client";

import { useEffect } from "react";
import { logout } from "@/lib/auth";

export default function LogoutPage() {
  useEffect(() => {
    logout();
  }, []);

  return <main className="p-8 text-center">Signing out...</main>;
}
