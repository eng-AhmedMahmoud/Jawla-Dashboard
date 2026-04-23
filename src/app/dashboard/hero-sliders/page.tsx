"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { HeroSlider } from "@/types";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  Plus,
  Search,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

export default function HeroSlidersPage() {
  const { addToast } = useAppStore();
  const router = useRouter();
  const [sliders, setSliders] = useState<HeroSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllHeroSliders();
      const items = Array.isArray(data) ? data : data.data || [];
      items.sort((a: HeroSlider, b: HeroSlider) => a.order - b.order);
      setSliders(items);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to fetch hero sliders",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteHeroSlider(id);
      addToast("Slider deleted successfully", "success");
      fetchSliders();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to delete slider",
        "error"
      );
    }
  };

  const handleToggleActive = async (item: HeroSlider) => {
    try {
      await apiService.updateHeroSlider(item.id, { isActive: !item.isActive });
      addToast(
        `Slider ${item.isActive ? "deactivated" : "activated"} successfully`,
        "success"
      );
      fetchSliders();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to update slider",
        "error"
      );
    }
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("localhost") && url.includes("/uploads/")) {
      return `https://back-jawla.tajera.net${url.replace(/^https?:\/\/[^/]+/, "")}`;
    }
    if (url.startsWith("http")) return url;
    return `https://back-jawla.tajera.net${url}`;
  };

  const filteredSliders = sliders.filter((item) => {
    const matchesSearch =
      item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titleAr.includes(searchTerm);
    return matchesSearch;
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
              Hero Sliders
            </h1>
            <p className="text-neutral-600 mt-1">
              Manage the homepage hero slider images and content
            </p>
          </div>
          <Link href="/dashboard/hero-sliders/new">
            <Button>
              <Plus size={20} />
              New Slider
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <Input
              placeholder="Search sliders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Title (EN)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Title (AR)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Link
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
              {filteredSliders.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-neutral-200 hover:bg-neutral-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <GripVertical size={16} className="text-neutral-400" />
                      <span className="font-medium">{item.order}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-14 rounded-lg overflow-hidden bg-neutral-100">
                      <img
                        src={resolveImageUrl(item.image)}
                        alt={item.titleEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700 text-sm max-w-xs">
                    <p className="line-clamp-2">{item.titleEn}</p>
                  </td>
                  <td
                    className="px-6 py-4 text-neutral-700 text-sm max-w-xs"
                    dir="rtl"
                  >
                    <p className="line-clamp-2">{item.titleAr}</p>
                  </td>
                  <td className="px-6 py-4 text-neutral-500 text-sm">
                    <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">
                      {item.linkUrl}
                    </span>
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
                        href={`/dashboard/hero-sliders/${item.id}/edit`}
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

          {filteredSliders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No sliders found</p>
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
        title="Delete Slider"
        message="This hero slider will be permanently deleted. This action cannot be undone."
      />
    </DashboardLayout>
  );
}
