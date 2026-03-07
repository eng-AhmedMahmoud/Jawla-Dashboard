"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toast } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
        <Toast />
      </div>
    </ProtectedRoute>
  );
}
