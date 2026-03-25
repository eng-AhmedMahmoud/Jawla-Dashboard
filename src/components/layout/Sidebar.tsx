"use client";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  Package,
  MessageSquare,
  FileText,
  Images,
  Info,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Packages", href: "/dashboard/packages", icon: Package },
  { name: "Blogs", href: "/dashboard/blogs", icon: BookOpen },
  { name: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
  { name: "Hero Sliders", href: "/dashboard/hero-sliders", icon: Images },
  { name: "About Page", href: "/dashboard/about", icon: Info },
  { name: "FAQ Page", href: "/dashboard/faq", icon: HelpCircle },
  { name: "Content", href: "/dashboard/content", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex w-64 bg-white border-r border-neutral-200 flex-col">
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* Footer */}
      <div className="border-t border-neutral-200 p-4 text-xs text-neutral-500">
        <p>Jawla Tours Admin</p>
      </div>
    </aside>
  );
}
