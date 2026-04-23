"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { apiService, resolveImageUrl } from "@/lib/api";
import { Blog } from "@/types";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function BlogsPage() {
  const { addToast } = useAppStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllBlogsAdmin();
      setBlogs(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to fetch blogs",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteBlog(id);
      addToast("Blog deleted successfully", "success");
      fetchBlogs();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to delete blog",
        "error"
      );
    }
  };

  const filteredBlogs = blogs.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.titleEn.toLowerCase().includes(term) ||
      item.titleAr.toLowerCase().includes(term)
    );
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
            <h1 className="text-3xl font-bold text-neutral-900">Blogs</h1>
            <p className="text-neutral-600 mt-1">
              Create and manage blog content
            </p>
          </div>
          <Link href="/dashboard/blogs/new">
            <Button>
              <Plus size={20} />
              New Article
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <Input
            placeholder="Search blog articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Tags
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((item) => (
                <tr key={item.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <img
                          src={resolveImageUrl(item.image)}
                          alt={item.titleEn}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/48?text=Blog";
                          }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-neutral-900">
                          {item.titleEn}
                        </p>
                        <p className="text-xs text-neutral-500">{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600 text-sm">
                    {formatDate(item.createdAt || new Date())}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/blogs/${item.id}/edit`}
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

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No blog articles found</p>
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
        title="Delete Blog Article"
        message="This blog article will be permanently deleted. This action cannot be undone."
      />
    </DashboardLayout>
  );
}
