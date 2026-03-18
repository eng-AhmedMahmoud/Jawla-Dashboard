"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { Content, ContentPage } from "@/types";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

const PAGE_OPTIONS: { value: ContentPage; label: string }[] = [
  { value: "HOME", label: "Home" },
  { value: "FLIGHTS", label: "Flights" },
  { value: "PACKAGES", label: "Packages" },
  { value: "HAJJ_UMRAH", label: "Hajj & Umrah" },
  { value: "BLOGS", label: "Blogs" },
  { value: "ABOUT", label: "About" },
  { value: "CONTACT", label: "Contact" },
  { value: "FAQ", label: "FAQ" },
];

export default function ContentManagementPage() {
  const { addToast } = useAppStore();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPage, setFilterPage] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllContentAdmin();
      setContents(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to fetch content",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteContent(id);
      addToast("Content deleted successfully", "success");
      fetchContents();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to delete content",
        "error"
      );
    }
  };

  const handleToggleActive = async (item: Content) => {
    try {
      await apiService.updateContent(item.id, { isActive: !item.isActive });
      addToast(
        `Content ${item.isActive ? "deactivated" : "activated"} successfully`,
        "success"
      );
      fetchContents();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to update content",
        "error"
      );
    }
  };

  const getPageLabel = (page: string) => {
    return PAGE_OPTIONS.find((p) => p.value === page)?.label || page;
  };

  const stripHtml = (html: string) => {
    if (typeof document !== "undefined") {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }
    return html.replace(/<[^>]*>/g, "");
  };

  const filteredContents = contents.filter((item) => {
    const plainEn = stripHtml(item.textEn).toLowerCase();
    const plainAr = stripHtml(item.textAr);
    const matchesSearch =
      plainEn.includes(searchTerm.toLowerCase()) ||
      plainAr.includes(searchTerm);
    const matchesPage = !filterPage || item.page === filterPage;
    return matchesSearch && matchesPage;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Page Content
            </h1>
            <p className="text-neutral-600 mt-1">
              Manage optional content sections displayed above the footer on
              each page
            </p>
          </div>
          <Link href="/dashboard/content/new">
            <Button>
              <Plus size={20} />
              New Content
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterPage}
            onChange={(e) => setFilterPage(e.target.value)}
            className="input-base w-full sm:w-48"
          >
            <option value="">All Pages</option>
            {PAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Page
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  English Text
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Arabic Text
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Updated
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredContents.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-neutral-200 hover:bg-neutral-50"
                >
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                      {getPageLabel(item.page)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-700 text-sm max-w-xs">
                    <p className="line-clamp-2">{stripHtml(item.textEn)}</p>
                  </td>
                  <td
                    className="px-6 py-4 text-neutral-700 text-sm max-w-xs"
                    dir="rtl"
                  >
                    <p className="line-clamp-2">{stripHtml(item.textAr)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        item.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                      }`}
                    >
                      {item.isActive ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-neutral-600 text-sm">
                    {formatDate(item.updatedAt || item.createdAt || new Date())}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/content/${item.id}/edit`}
                        className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-neutral-600" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredContents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No content found</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await handleDelete(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Content"
        message="This content section will be permanently deleted. This action cannot be undone."
      />
    </DashboardLayout>
  );
}
