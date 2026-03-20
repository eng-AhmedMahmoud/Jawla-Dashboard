"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { ContentPage } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export default function NewContentPage() {
  const { addToast } = useAppStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    page: "HOME" as ContentPage,
    textAr: "",
    textEn: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.textAr) newErrors.textAr = "Arabic text is required";
    if (!formData.textEn) newErrors.textEn = "English text is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createContent(formData);
      addToast("Content created successfully", "success");
      router.push("/dashboard/content");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Operation failed. Please try again.";
      addToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/content"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Create New Content
            </h1>
            <p className="text-neutral-600 mt-1">
              Add a new content section for a page
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <label className="flex items-center gap-2">
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <Link href="/dashboard/content">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={submitting}>
                Create Content
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
