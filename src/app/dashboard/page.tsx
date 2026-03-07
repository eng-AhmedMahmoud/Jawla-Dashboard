"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { apiService } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Package,
  BookOpen,
  TrendingUp,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalPackages: number;
  totalNews: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPackages: 0,
    totalNews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersData, packagesData, newsData] = await Promise.all([
        apiService.getAllUsers().catch(() => []),
        apiService.getAllPackages().catch(() => []),
        apiService.getAllNewsAdmin().catch(() => []),
      ]);

      // Calculate stats
      setStats({
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalPackages: Array.isArray(packagesData) ? packagesData.length : 0,
        totalNews: Array.isArray(newsData) ? newsData.length : 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      name: "Packages",
      value: stats.totalPackages,
      icon: Package,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      name: "News",
      value: stats.totalNews,
      icon: BookOpen,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-primary-100">
            Here's what's happening with your Jawla Tours business today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`${stat.iconColor}`} size={24} />
                  </div>
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <p className="text-neutral-600 text-sm font-medium">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {loading ? "..." : stat.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/dashboard/packages")}
              className="flex flex-col items-center justify-center gap-2 py-6 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Package size={28} />
              <span>Add New Package</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/news")}
              className="flex flex-col items-center justify-center gap-2 py-6 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors shadow-sm border border-purple-100"
            >
              <BookOpen size={28} />
              <span>Write News Article</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/users")}
              className="flex flex-col items-center justify-center gap-2 py-6 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors shadow-sm border border-neutral-200"
            >
              <Users size={28} />
              <span>View All Users</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
