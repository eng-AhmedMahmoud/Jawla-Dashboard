"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { HajjUmrahConfig, HajjUmrahCard } from "@/types";
import { useEffect, useState } from "react";
import { Save, Settings, LayoutGrid } from "lucide-react";

type ActiveTab = "config" | "cards";

export default function HajjUmrahPageManagement() {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("config");
  const [loading, setLoading] = useState(true);

  // Config state
  const [config, setConfig] = useState<HajjUmrahConfig | null>(null);
  const [configForm, setConfigForm] = useState({
    heroTitleAr: "",
    heroTitleEn: "",
    heroDetailsAr: "",
    heroDetailsEn: "",
  });
  const [configSaving, setConfigSaving] = useState(false);

  // Cards state
  const [hajjCard, setHajjCard] = useState<HajjUmrahCard | null>(null);
  const [umrahCard, setUmrahCard] = useState<HajjUmrahCard | null>(null);

  const [hajjForm, setHajjForm] = useState({
    titleAr: "",
    titleEn: "",
    imageUrl: "",
    buttonTextAr: "",
    buttonTextEn: "",
    isActive: true,
  });

  const [umrahForm, setUmrahForm] = useState({
    titleAr: "",
    titleEn: "",
    imageUrl: "",
    buttonTextAr: "",
    buttonTextEn: "",
    isActive: true,
  });

  const [cardsSaving, setCardsSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await apiService.getHajjUmrahAdmin();

      // Config
      if (data.config) {
        setConfig(data.config);
        setConfigForm({
          heroTitleAr: data.config.heroTitleAr || "",
          heroTitleEn: data.config.heroTitleEn || "",
          heroDetailsAr: data.config.heroDetailsAr || "",
          heroDetailsEn: data.config.heroDetailsEn || "",
        });
      }

      // Cards - API returns cards as an array
      const cards = Array.isArray(data.cards) ? data.cards : [];
      const hajj = cards.find((c: any) => c.cardType === "HAJJ") || data.hajj;
      const umrah = cards.find((c: any) => c.cardType === "UMRAH") || data.umrah;

      if (hajj) {
        setHajjCard(hajj);
        setHajjForm({
          titleAr: hajj.titleAr || "",
          titleEn: hajj.titleEn || "",
          imageUrl: hajj.imageUrl || "",
          buttonTextAr: hajj.buttonTextAr || "",
          buttonTextEn: hajj.buttonTextEn || "",
          isActive: hajj.isActive ?? true,
        });
      }

      if (umrah) {
        setUmrahCard(umrah);
        setUmrahForm({
          titleAr: umrah.titleAr || "",
          titleEn: umrah.titleEn || "",
          imageUrl: umrah.imageUrl || "",
          buttonTextAr: umrah.buttonTextAr || "",
          buttonTextEn: umrah.buttonTextEn || "",
          isActive: umrah.isActive ?? true,
        });
      }
    } catch (error: any) {
      addToast(
        error.response?.data?.message ||
          "Failed to load Hajj & Umrah page data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Config handlers ───
  const handleConfigSave = async () => {
    setConfigSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const [key, val] of Object.entries(configForm)) {
        payload[key] = val || null;
      }
      await apiService.updateHajjUmrahConfig(payload);
      addToast("Hero config updated successfully", "success");
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to update config",
        "error"
      );
    } finally {
      setConfigSaving(false);
    }
  };

  // ─── Cards handlers ───
  const handleCardsSave = async () => {
    setCardsSaving(true);
    try {
      const buildPayload = (form: typeof hajjForm) => ({
        titleAr: form.titleAr || undefined,
        titleEn: form.titleEn || undefined,
        imageUrl: form.imageUrl || null,
        buttonTextAr: form.buttonTextAr || null,
        buttonTextEn: form.buttonTextEn || null,
        isActive: form.isActive,
      });

      await Promise.all([
        apiService.updateHajjUmrahCard("HAJJ", buildPayload(hajjForm)),
        apiService.updateHajjUmrahCard("UMRAH", buildPayload(umrahForm)),
      ]);
      addToast("Cards updated successfully", "success");
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to save cards",
        "error"
      );
    } finally {
      setCardsSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "config", label: "Hero Config", icon: <Settings size={18} /> },
    { key: "cards", label: "Cards", icon: <LayoutGrid size={18} /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Hajj & Umrah Page
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage the Hajj & Umrah page hero section and program cards
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── CONFIG TAB ─── */}
        {activeTab === "config" && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Hero Section
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hero Title (English)"
                value={configForm.heroTitleEn}
                onChange={(e) =>
                  setConfigForm({ ...configForm, heroTitleEn: e.target.value })
                }
                placeholder="Hajj & Umrah Services"
              />
              <Input
                label="Hero Title (Arabic)"
                value={configForm.heroTitleAr}
                onChange={(e) =>
                  setConfigForm({ ...configForm, heroTitleAr: e.target.value })
                }
                placeholder="خدمات الحج و العمرة"
                dir="rtl"
              />
              <Textarea
                label="Hero Details (English)"
                value={configForm.heroDetailsEn}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    heroDetailsEn: e.target.value,
                  })
                }
                placeholder="We provide comprehensive Hajj & Umrah services..."
                className="min-h-28"
              />
              <Textarea
                label="Hero Details (Arabic)"
                value={configForm.heroDetailsAr}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    heroDetailsAr: e.target.value,
                  })
                }
                placeholder="نقدم خدمات شاملة للحج والعمرة..."
                className="min-h-28"
                dir="rtl"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleConfigSave} disabled={configSaving}>
                <Save size={18} />
                {configSaving ? "Saving..." : "Save Config"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── CARDS TAB ─── */}
        {activeTab === "cards" && (
          <div className="space-y-6">
            {/* Hajj Card */}
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                Hajj Card
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title (English)"
                  value={hajjForm.titleEn}
                  onChange={(e) =>
                    setHajjForm({ ...hajjForm, titleEn: e.target.value })
                  }
                  placeholder="Hajj Programs"
                />
                <Input
                  label="Title (Arabic)"
                  value={hajjForm.titleAr}
                  onChange={(e) =>
                    setHajjForm({ ...hajjForm, titleAr: e.target.value })
                  }
                  placeholder="برامج الحج"
                  dir="rtl"
                />
              </div>

              <ImageUpload
                label="Card Image"
                value={hajjForm.imageUrl}
                onChange={(url) => setHajjForm({ ...hajjForm, imageUrl: url })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Button Text (English)"
                  value={hajjForm.buttonTextEn}
                  onChange={(e) =>
                    setHajjForm({ ...hajjForm, buttonTextEn: e.target.value })
                  }
                  placeholder="View More"
                />
                <Input
                  label="Button Text (Arabic)"
                  value={hajjForm.buttonTextAr}
                  onChange={(e) =>
                    setHajjForm({ ...hajjForm, buttonTextAr: e.target.value })
                  }
                  placeholder="عرض المزيد"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Umrah Card */}
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                Umrah Card
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title (English)"
                  value={umrahForm.titleEn}
                  onChange={(e) =>
                    setUmrahForm({ ...umrahForm, titleEn: e.target.value })
                  }
                  placeholder="Umrah Programs"
                />
                <Input
                  label="Title (Arabic)"
                  value={umrahForm.titleAr}
                  onChange={(e) =>
                    setUmrahForm({ ...umrahForm, titleAr: e.target.value })
                  }
                  placeholder="برامج العمرة"
                  dir="rtl"
                />
              </div>

              <ImageUpload
                label="Card Image"
                value={umrahForm.imageUrl}
                onChange={(url) =>
                  setUmrahForm({ ...umrahForm, imageUrl: url })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Button Text (English)"
                  value={umrahForm.buttonTextEn}
                  onChange={(e) =>
                    setUmrahForm({
                      ...umrahForm,
                      buttonTextEn: e.target.value,
                    })
                  }
                  placeholder="View More"
                />
                <Input
                  label="Button Text (Arabic)"
                  value={umrahForm.buttonTextAr}
                  onChange={(e) =>
                    setUmrahForm({
                      ...umrahForm,
                      buttonTextAr: e.target.value,
                    })
                  }
                  placeholder="عرض المزيد"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCardsSave} disabled={cardsSaving}>
                <Save size={18} />
                {cardsSaving ? "Saving..." : "Save Cards"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
