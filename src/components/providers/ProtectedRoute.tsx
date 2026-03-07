"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated || !user || user.role !== 'ADMIN') {
        router.push("/auth/login");
      }
    }
  }, [isAuthenticated, isHydrated, user, router]);

  // Don't render anything if not authenticated or not admin
  if (!isHydrated || !isAuthenticated || !user || user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}