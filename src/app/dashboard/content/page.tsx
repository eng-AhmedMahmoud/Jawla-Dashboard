"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/Loading";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { Content, ContentPage } from "@/types";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";

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
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    page: "HOME" as ContentPage,
    textAr: "",
    textEn: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleOpenModal = (item?: Content) => {
    if (item) {
      setIsEditMode(true);
      setSelectedContent(item);
      setFormData({
        page: item.page,
        textAr: item.textAr,
        textEn: item.textEn,
        isActive: item.isActive,
      });
    } else {
      setIsEditMode(false);
      setSelectedContent(null);
      setFormData({
        page: "HOME",
        textAr: "",
        textEn: "",
        isActive: true,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.textAr) newErrors.textAr = "Arabic text is required";
    if (!formData.textEn) newErrors.textEn = "English text is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditMode && selectedContent) {
        await apiService.updateContent(selectedContent.id, formData);
        addToast("Content updated successfully", "success");
      } else {
        await apiService.createContent(formData);
        addToast("Content created successfully", "success");
      }

      setIsModalOpen(false);
      fetchContents();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Operation failed. Please try again.";
      addToast(errorMsg, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
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
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} />
            New Content
          </Button>
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
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-neutral-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit Content" : "Create New Content"}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditMode ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Select
            label="Target Page"
            value={formData.page}
            onChange={(e) =>
              setFormData({
                ...formData,
                page: e.target.value as ContentPage,
              })
            }
          >
            {PAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <RichTextEditor
            label="English Text"
            value={formData.textEn}
            onChange={(html) =>
              setFormData({ ...formData, textEn: html })
            }
            error={errors.textEn}
            placeholder="Enter content text in English..."
          />

          <RichTextEditor
            label="Arabic Text"
            value={formData.textAr}
            onChange={(html) =>
              setFormData({ ...formData, textAr: html })
            }
            error={errors.textAr}
            placeholder="أدخل نص المحتوى بالعربية..."
            className="[&_.ProseMirror]:text-right"
          />

          <div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-neutral-700 font-medium">
                Active (visible on website)
              </span>
            </label>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
