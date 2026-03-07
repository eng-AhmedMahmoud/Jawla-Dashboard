"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/Loading";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, isHydrated, isHydrating } = useAuthStore();

  useEffect(() => {
    // Initialize authentication on app start
    initialize();
  }, [initialize]);

  // Show loading screen while hydrating authentication state (not during login attempts)
  if (!isHydrated || isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}