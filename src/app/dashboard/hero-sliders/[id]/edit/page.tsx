"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { HeroSlider } from "@/types";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditHeroSliderPage() {
  const { addToast } = useAppStore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingOrders, setExistingOrders] = useState<number[]>([]);
  const [originalOrder, setOriginalOrder] = useState<number>(0);
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    subtitleAr: "",
    subtitleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    image: "",
    order: 1,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slider, allSliders] = await Promise.all([
          apiService.getHeroSliderById(id),
          apiService.getAllHeroSliders(),
        ]);
        const data = slider as HeroSlider;
        setFormData({
          titleAr: data.titleAr,
          titleEn: data.titleEn,
          subtitleAr: data.subtitleAr || "",
          subtitleEn: data.subtitleEn || "",
          descriptionAr: data.descriptionAr || "",
          descriptionEn: data.descriptionEn || "",
          image: data.image,
          order: data.order,
          isActive: data.isActive,
        });
        setOriginalOrder(data.order);
        const items: HeroSlider[] = Array.isArray(allSliders) ? allSliders : allSliders.data || [];
        setExistingOrders(items.filter((s) => s.id !== id).map((s) => s.order));
      } catch (error: any) {
        addToast(
          error.response?.data?.message || "Failed to load slider",
          "error"
        );
        router.push("/dashboard/hero-sliders");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.titleAr) newErrors.titleAr = "Arabic title is required";
    if (!formData.titleEn) newErrors.titleEn = "English title is required";
    if (!formData.image) newErrors.image = "Image is required";
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
      await apiService.updateHeroSlider(id, formData);
      addToast("Slider updated successfully", "success");
      router.push("/dashboard/hero-sliders");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Operation failed. Please try again.";
      addToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

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
              Edit Slider
            </h1>
            <p className="text-neutral-600 mt-1">
              Update the slider details and image
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

            <Input
              label="Subtitle H2 (English)"
              value={formData.subtitleEn}
              onChange={(e) =>
                setFormData({ ...formData, subtitleEn: e.target.value })
              }
              placeholder="e.g. Summer Deals (optional)"
            />

            <Input
              label="Subtitle H2 (Arabic)"
              value={formData.subtitleAr}
              onChange={(e) =>
                setFormData({ ...formData, subtitleAr: e.target.value })
              }
              placeholder="مثال: عروض الصيف (اختياري)"
              dir="rtl"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Description (English)
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                placeholder="Optional description text for the slide"
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Description (Arabic)
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionAr: e.target.value })
                }
                placeholder="وصف اختياري للشريحة"
                rows={3}
                dir="rtl"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

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
                Update Slider
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
