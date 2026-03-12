"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Menu, LogOut, User, LayoutDashboard, Users, Package, BookOpen, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Packages", href: "/dashboard/packages", icon: Package },
  { name: "Blogs", href: "/dashboard/blogs", icon: BookOpen },
  { name: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
];

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              JT
            </div>
            <span className="font-bold text-neutral-900 hidden sm:inline">
              Jawla Admin
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Mobile Nav Toggle */}
            <button
              onClick={() => { setMobileNavOpen(!mobileNavOpen); setShowMenu(false); }}
              className="sm:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {mobileNavOpen ? <X size={20} className="text-neutral-600" /> : <Menu size={20} className="text-neutral-600" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowMenu(!showMenu); setMobileNavOpen(false); }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-neutral-500">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <nav className="sm:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600 font-medium"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
