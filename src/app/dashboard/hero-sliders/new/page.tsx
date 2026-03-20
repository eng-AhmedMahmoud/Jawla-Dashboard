"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { HeroSlider } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewHeroSliderPage() {
  const { addToast } = useAppStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [existingOrders, setExistingOrders] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    image: "",
    linkUrl: "",
    order: 1,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing sliders to know taken orders and auto-set next order
  useEffect(() => {
    apiService.getAllHeroSliders().then((data) => {
      const items: HeroSlider[] = Array.isArray(data) ? data : data.data || [];
      const orders = items.map((s) => s.order);
      setExistingOrders(orders);
      const nextOrder = orders.length > 0 ? Math.max(...orders) + 1 : 1;
      setFormData((prev) => ({ ...prev, order: nextOrder }));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.titleAr) newErrors.titleAr = "Arabic title is required";
    if (!formData.titleEn) newErrors.titleEn = "English title is required";
    if (!formData.image) newErrors.image = "Image is required";
    if (!formData.linkUrl) newErrors.linkUrl = "Link URL is required";
    if (!formData.order || formData.order < 1)
      newErrors.order = "Order must be at least 1";
    else if (existingOrders.includes(formData.order))
      newErrors.order = `Order ${formData.order} is already taken. Use a different number.`;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createHeroSlider(formData);
      addToast("Slider created successfully", "success");
      router.push("/dashboard/hero-sliders");
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/hero-sliders"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Create New Slider
            </h1>
            <p className="text-neutral-600 mt-1">
              Add a new slide to the homepage hero section
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Title (English)"
              value={formData.titleEn}
              onChange={(e) =>
                setFormData({ ...formData, titleEn: e.target.value })
              }
              error={errors.titleEn}
              placeholder="e.g. Discover Beautiful Egypt"
            />

            <Input
              label="Title (Arabic)"
              value={formData.titleAr}
              onChange={(e) =>
                setFormData({ ...formData, titleAr: e.target.value })
              }
              error={errors.titleAr}
              placeholder="مثال: اكتشف مصر الجميلة"
              dir="rtl"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Slider Image
              </label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
            </div>

            <Input
              label="Link URL"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
              error={errors.linkUrl}
              placeholder="e.g. /packages?type=HAJJ"
            />

            <Input
              label="Display Order"
              type="number"
              value={formData.order.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 1,
                })
              }
              error={errors.order}
              min={1}
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
              <Link href="/dashboard/hero-sliders">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={submitting}>
                Create Slider
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
