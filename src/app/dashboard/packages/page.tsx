"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { apiService, resolveImageUrl } from "@/lib/api";
import { Package } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function PackagesPage() {
  const { addToast } = useAppStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
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
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.titleAr.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Link href="/dashboard/packages/new">
            <Button>
              <Plus size={20} />
              Add Package
            </Button>
          </Link>
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
              <div className="relative h-48 bg-neutral-200 overflow-hidden">
                {pkg.image ? (
                  <img
                    src={resolveImageUrl(pkg.image)}
                    alt={pkg.titleEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300x200?text=Package";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">No Image</span>
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

              <div className="p-5">
                <h3 className="font-bold text-neutral-900 mb-2 truncate">{pkg.titleEn}</h3>
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{pkg.descriptionEn}</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 text-sm">Duration</span>
                    <span className="font-semibold text-neutral-900">{pkg.duration}</span>
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
                      {pkg.includedServicesEn.slice(0, 2).map((service, i) => (
                        <span key={i} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                      {pkg.includedServicesEn.length > 2 && (
                        <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                          +{pkg.includedServicesEn.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Link
                    href={`/dashboard/packages/${pkg.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors font-medium"
                  >
                    <Edit2 size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(pkg.id)}
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

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await handleDelete(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Package"
        message="This travel package will be permanently deleted. This action cannot be undone."
      />
    </DashboardLayout>
  );
}
