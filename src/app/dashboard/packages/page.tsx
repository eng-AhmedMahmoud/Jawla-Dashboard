"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { Package, PackageType } from "@/types";
import { formatPrice, formatDate, generateSlug } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search } from "lucide-react";

export default function PackagesPage() {
  const { addToast } = useAppStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllPackages();
      setPackages(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to fetch packages",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg?: Package) => {
    if (pkg) {
      setIsEditMode(true);
      setSelectedPackage(pkg);
      setFormData({
        title: pkg.title,
        description: pkg.description,
        price: pkg.price.toString(),
        currency: pkg.currency || "EGP",
        duration: pkg.duration,
        image: pkg.image,
        isFeatured: pkg.isFeatured || false,
        type: pkg.type || "GENERAL",
        includedServices: pkg.includedServices,
        newService: "",
      });
    } else {
      setIsEditMode(false);
      setSelectedPackage(null);
      setFormData({
        title: "",
        description: "",
        price: "",
        currency: "EGP",
        duration: "",
        image: "",
        isFeatured: false,
        type: "GENERAL",
        includedServices: [],
        newService: "",
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleAddService = () => {
    if (formData.newService.trim()) {
      setFormData((prev) => ({
        ...prev,
        includedServices: [...prev.includedServices, prev.newService],
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
    if (!formData.image) newErrors.image = "Image URL is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (formData.includedServices.length === 0)
      newErrors.includedServices = "At least one service is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration: formData.duration,
        image: formData.image,
        isFeatured: formData.isFeatured,
        type: formData.type,
        includedServices: formData.includedServices,
      };

      if (isEditMode && selectedPackage) {
        await apiService.updatePackage(selectedPackage.id, submitData);
        addToast("Package updated successfully", "success");
      } else {
        await apiService.createPackage(submitData);
        addToast("Package created successfully", "success");
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Operation failed. Please try again.";
      addToast(errorMsg, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      try {
        await apiService.deletePackage(id);
        addToast("Package deleted successfully", "success");
        fetchPackages();
      } catch (error: any) {
        addToast(
          error.response?.data?.message || "Failed to delete package",
          "error"
        );
      }
    }
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-neutral-900">Packages</h1>
            <p className="text-neutral-600 mt-1">Manage your travel packages</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} />
            Add Package
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-neutral-200 overflow-hidden">
                {pkg.image ? (
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300x200?text=Package";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      No Image
                    </span>
                  </div>
                )}
                {pkg.isFeatured && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}
                {pkg.type && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-primary-600 text-white">
                    {pkg.type}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-neutral-900 mb-2 truncate">
                  {pkg.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 text-sm">Duration</span>
                    <span className="font-semibold text-neutral-900">
                      {pkg.duration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 text-sm">Price</span>
                    <span className="font-bold text-primary-600">
                      {formatPrice(pkg.price, pkg.currency)}
                    </span>
                  </div>
                  <div>
                    <p className="text-neutral-600 text-sm mb-2">Services</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.includedServices.slice(0, 2).map((service, i) => (
                        <span
                          key={i}
                          className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                        >
                          {service}
                        </span>
                      ))}
                      {pkg.includedServices.length > 2 && (
                        <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                          +{pkg.includedServices.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleOpenModal(pkg)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors font-medium"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No packages found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit Package" : "Add New Package"}
        size="lg"
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
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
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
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            error={errors.description}
            placeholder="Describe this travel package..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              error={errors.price}
              placeholder="27800"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
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
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            error={errors.duration}
            placeholder="e.g., 10 Days"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as PackageType })
              }
              className="input-base w-full"
            >
              <option value="GENERAL">General</option>
              <option value="HAJJ">Hajj</option>
              <option value="UMRAH">Umrah</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          <Input
            label="Image URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            error={errors.image}
            placeholder="https://example.com/image.jpg"
          />

          <div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-neutral-700 font-medium">
                Show on homepage (Featured)
              </span>
            </label>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Included Services
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                value={formData.newService}
                onChange={(e) =>
                  setFormData({ ...formData, newService: e.target.value })
                }
                placeholder="Add service (e.g., Flight)"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddService}
                variant="secondary"
              >
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
        </form>
      </Modal>
    </DashboardLayout>
  );
}
