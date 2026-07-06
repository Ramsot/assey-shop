"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAdminAuth() {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/admin/logout", { method: "POST" });
    } catch {
      // proceed anyway
    }
    router.push("/login");
    router.refresh();
  }, [router]);

  return { logout };
}
