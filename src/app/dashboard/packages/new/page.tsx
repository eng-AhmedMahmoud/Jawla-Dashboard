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
    title: "",
    description: "",
    price: "",
    currency: "EGP",
    duration: "",
    image: "",
    isFeatured: false,
    type: "GENERAL" as PackageType,
    includedServices: [] as string[],
    newService: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddService = () => {
    if (formData.newService.trim()) {
      setFormData((prev) => ({
        ...prev,
        includedServices: [...prev.includedServices, prev.newService.trim()],
        newService: "",
      }));
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includedServices: prev.includedServices.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.image) newErrors.image = "Image is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (formData.includedServices.length === 0)
      newErrors.includedServices = "At least one service is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createPackage({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration: formData.duration,
        image: formData.image,
        isFeatured: formData.isFeatured,
        type: formData.type,
        includedServices: formData.includedServices,
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
      <div className="max-w-2xl mx-auto space-y-6">
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Package Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              placeholder="e.g., Saudi Arabia Trips"
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={errors.description}
              placeholder="Describe this travel package..."
            />

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

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Included Services
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={formData.newService}
                  onChange={(e) => setFormData({ ...formData, newService: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                  placeholder="Add service (e.g., Flight)"
                  className="flex-1"
                />
                <Button type="button" size="sm" onClick={handleAddService} variant="secondary">
                  Add
                </Button>
              </div>
              {errors.includedServices && (
                <p className="text-red-500 text-sm mb-2">{errors.includedServices}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.includedServices.map((service, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(i)}
                      className="text-primary-700 hover:text-primary-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
