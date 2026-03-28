"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";

const HAJJ_IMAGE_KEY = "hajj_card_image";
const UMRAH_IMAGE_KEY = "umrah_card_image";

export default function HajjUmrahPageManagement() {
  const { addToast } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [hajjImageUrl, setHajjImageUrl] = useState("");
  const [umrahImageUrl, setUmrahImageUrl] = useState("");
  const [hajjContentId, setHajjContentId] = useState<string | null>(null);
  const [umrahContentId, setUmrahContentId] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await apiService.getContent("HAJJ_UMRAH");
      const items = Array.isArray(data) ? data : data.data ?? [];
      const hajjItem = items.find((c: any) => c.textAr === HAJJ_IMAGE_KEY);
      const umrahItem = items.find((c: any) => c.textAr === UMRAH_IMAGE_KEY);
      if (hajjItem) {
        setHajjImageUrl(hajjItem.textEn || "");
        setHajjContentId(hajjItem.id);
      }
      if (umrahItem) {
        setUmrahImageUrl(umrahItem.textEn || "");
        setUmrahContentId(umrahItem.id);
      }
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to load images",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save Hajj image
      if (hajjContentId) {
        await apiService.updateContent(hajjContentId, {
          textEn: hajjImageUrl,
        });
      } else if (hajjImageUrl) {
        await apiService.createContent({
          page: "HAJJ_UMRAH",
          textAr: HAJJ_IMAGE_KEY,
          textEn: hajjImageUrl,
          isActive: true,
        });
      }

      // Save Umrah image
      if (umrahContentId) {
        await apiService.updateContent(umrahContentId, {
          textEn: umrahImageUrl,
        });
      } else if (umrahImageUrl) {
        await apiService.createContent({
          page: "HAJJ_UMRAH",
          textAr: UMRAH_IMAGE_KEY,
          textEn: umrahImageUrl,
          isActive: true,
        });
      }

      addToast("Images updated successfully", "success");
      fetchImages();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to save images",
        "error"
      );
    } finally {
      setSaving(false);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Hajj & Umrah Page
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage the card images shown on the Hajj & Umrah page
          </p>
        </div>

        <div className="card p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ImageUpload
                label="Hajj Programs Card Image"
                value={hajjImageUrl}
                onChange={(url) => setHajjImageUrl(url)}
              />
            </div>
            <div>
              <ImageUpload
                label="Umrah Programs Card Image"
                value={umrahImageUrl}
                onChange={(url) => setUmrahImageUrl(url)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Save Images"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
