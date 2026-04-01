"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { PackageType } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPackagePage() {
  const { addToast } = useAppStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    price: "",
    currency: "EGP",
    duration: "",
    image: "",
    isFeatured: false,
    type: "GENERAL" as PackageType,
    includedServicesEn: [] as string[],
    includedServicesAr: [] as string[],
    newServiceEn: "",
    newServiceAr: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddServiceEn = () => {
    if (formData.newServiceEn.trim()) {
      setFormData((prev) => ({
        ...prev,
        includedServicesEn: [...prev.includedServicesEn, prev.newServiceEn.trim()],
        newServiceEn: "",
      }));
    }
  };

  const handleRemoveServiceEn = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includedServicesEn: prev.includedServicesEn.filter((_, i) => i !== index),
    }));
  };

  const handleAddServiceAr = () => {
    if (formData.newServiceAr.trim()) {
      setFormData((prev) => ({
        ...prev,
        includedServicesAr: [...prev.includedServicesAr, prev.newServiceAr.trim()],
        newServiceAr: "",
      }));
    }
  };

  const handleRemoveServiceAr = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includedServicesAr: prev.includedServicesAr.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.titleEn) newErrors.titleEn = "English title is required";
    if (!formData.titleAr) newErrors.titleAr = "Arabic title is required";
    if (!formData.descriptionEn) newErrors.descriptionEn = "English description is required";
    if (!formData.descriptionAr) newErrors.descriptionAr = "Arabic description is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (formData.includedServicesEn.length === 0)
      newErrors.includedServicesEn = "At least one English service is required";
    if (formData.includedServicesAr.length === 0)
      newErrors.includedServicesAr = "At least one Arabic service is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createPackage({
        titleEn: formData.titleEn,
        titleAr: formData.titleAr,
        descriptionEn: formData.descriptionEn,
        descriptionAr: formData.descriptionAr,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration: formData.duration,
        image: formData.image,
        isFeatured: formData.isFeatured,
        type: formData.type,
        includedServicesEn: formData.includedServicesEn,
        includedServicesAr: formData.includedServicesAr,
      });
      addToast("Package created successfully", "success");
      router.push("/dashboard/packages");
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/packages"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Add New Package</h1>
            <p className="text-neutral-600 mt-1">Create a new travel package</p>
          </div>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* English Content Section */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                English Content
              </h2>
              <div className="space-y-5">
                <Input
                  label="Title (English)"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  error={errors.titleEn}
                  placeholder="e.g., Saudi Arabia Trips"
                />

                <Textarea
                  label="Description (English)"
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  error={errors.descriptionEn}
                  placeholder="Describe this travel package in English..."
                />

                {/* English Services */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Included Services (English)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={formData.newServiceEn}
                      onChange={(e) => setFormData({ ...formData, newServiceEn: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddServiceEn();
                        }
                      }}
                      placeholder="Add service (e.g., Flight)"
                      className="flex-1"
                    />
                    <Button type="button" size="sm" onClick={handleAddServiceEn} variant="secondary">
                      Add
                    </Button>
                  </div>
                  {errors.includedServicesEn && (
                    <p className="text-red-500 text-sm mb-2">{errors.includedServicesEn}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.includedServicesEn.map((service, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceEn(i)}
                          className="text-primary-700 hover:text-primary-900 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Arabic Content Section */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                المحتوى العربي (Arabic Content)
              </h2>
              <div className="space-y-5">
                <Input
                  label="العنوان (Arabic)"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  error={errors.titleAr}
                  placeholder="مثال: رحلات المملكة العربية السعودية"
                  dir="rtl"
                />

                <Textarea
                  label="الوصف (Arabic)"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  error={errors.descriptionAr}
                  placeholder="صف هذه الباقة السياحية بالعربية..."
                  dir="rtl"
                />

                {/* Arabic Services */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    الخدمات المشمولة (Arabic)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={formData.newServiceAr}
                      onChange={(e) => setFormData({ ...formData, newServiceAr: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddServiceAr();
                        }
                      }}
                      placeholder="أضف خدمة (مثال: طيران)"
                      className="flex-1"
                      dir="rtl"
                    />
                    <Button type="button" size="sm" onClick={handleAddServiceAr} variant="secondary">
                      Add
                    </Button>
                  </div>
                  {errors.includedServicesAr && (
                    <p className="text-red-500 text-sm mb-2">{errors.includedServicesAr}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.includedServicesAr.map((service, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                        dir="rtl"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceAr(i)}
                          className="text-primary-700 hover:text-primary-900 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Common Fields Section */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Package Details
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    error={errors.price}
                    placeholder="27800"
                  />
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="input-base w-full"
                    >
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="SAR">SAR</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  error={errors.duration}
                  placeholder="e.g., 10 Days"
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PackageType })}
                    className="input-base w-full"
                  >
                    <option value="GENERAL">General</option>
                    <option value="HAJJ">Hajj</option>
                    <option value="UMRAH">Umrah</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>

                <ImageUpload
                  label="Package Image"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  error={errors.image}
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-neutral-700 font-medium">Show on homepage (Featured)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
              <Link href="/dashboard/packages">
                <Button variant="secondary" type="button">Cancel</Button>
              </Link>
              <Button type="submit" loading={submitting}>Create Package</Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
