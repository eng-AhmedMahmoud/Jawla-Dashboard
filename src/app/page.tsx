"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated && user?.role === 'ADMIN') {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  return null; // AuthProvider handles loading state
}
