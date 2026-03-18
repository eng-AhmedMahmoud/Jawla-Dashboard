"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import {
  AboutConfig,
  AboutStat,
  AboutCard,
  AboutCardSection,
} from "@/types";
import { useEffect, useState } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  Save,
  BarChart3,
  LayoutGrid,
  Settings,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

type ActiveTab = "config" | "stats" | "cards";

const CARD_SECTION_OPTIONS: { value: AboutCardSection; label: string }[] = [
  { value: "VISION_MISSION", label: "Vision & Mission" },
  { value: "VALUES", label: "Values" },
  { value: "SERVICES", label: "Services" },
];

function getSectionLabel(section: string) {
  return (
    CARD_SECTION_OPTIONS.find((s) => s.value === section)?.label || section
  );
}

export default function AboutPageManagement() {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("config");
  const [loading, setLoading] = useState(true);

  // Config state
  const [config, setConfig] = useState<AboutConfig | null>(null);
  const [configForm, setConfigForm] = useState({
    heroTitleAr: "",
    heroTitleEn: "",
    heroSubtitleAr: "",
    heroSubtitleEn: "",
    heroIconUrl: "",
    aboutTitleAr: "",
    aboutTitleEn: "",
    aboutDescriptionAr: "",
    aboutDescriptionEn: "",
    aboutImageUrl: "",
    aboutImageCaptionAr: "",
    aboutImageCaptionEn: "",
  });
  const [configSaving, setConfigSaving] = useState(false);

  // Stats state
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [isStatEditMode, setIsStatEditMode] = useState(false);
  const [selectedStat, setSelectedStat] = useState<AboutStat | null>(null);
  const [statForm, setStatForm] = useState({
    labelAr: "",
    labelEn: "",
    valueAr: "",
    valueEn: "",
    order: 0,
  });
  const [statErrors, setStatErrors] = useState<Record<string, string>>({});

  // Cards state
  const [cards, setCards] = useState<AboutCard[]>([]);
  const [cardSectionFilter, setCardSectionFilter] = useState<string>("");
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCardEditMode, setIsCardEditMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AboutCard | null>(null);
  const [cardForm, setCardForm] = useState({
    section: "VISION_MISSION" as AboutCardSection,
    titleAr: "",
    titleEn: "",
    bodyAr: "",
    bodyEn: "",
    iconName: "",
    iconColor: "",
    order: 0,
    isActive: true,
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "stat" | "card"; id: string } | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAboutPage();
      // Config
      if (data.config) {
        setConfig(data.config);
        setConfigForm({
          heroTitleAr: data.config.heroTitleAr || "",
          heroTitleEn: data.config.heroTitleEn || "",
          heroSubtitleAr: data.config.heroSubtitleAr || "",
          heroSubtitleEn: data.config.heroSubtitleEn || "",
          heroIconUrl: data.config.heroIconUrl || "",
          aboutTitleAr: data.config.aboutTitleAr || "",
          aboutTitleEn: data.config.aboutTitleEn || "",
          aboutDescriptionAr: data.config.aboutDescriptionAr || "",
          aboutDescriptionEn: data.config.aboutDescriptionEn || "",
          aboutImageUrl: data.config.aboutImageUrl || "",
          aboutImageCaptionAr: data.config.aboutImageCaptionAr || "",
          aboutImageCaptionEn: data.config.aboutImageCaptionEn || "",
        });
      }
      // Stats
      setStats(Array.isArray(data.stats) ? data.stats : []);
      // Cards - combine all sections
      const allCards = [
        ...(data.visionMission || []),
        ...(data.values || []),
        ...(data.services || []),
      ];
      setCards(allCards);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to load About page data",
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
      await apiService.updateAboutConfig(payload);
      addToast("About page config updated successfully", "success");
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

  // ─── Stats handlers ───
  const handleOpenStatModal = (item?: AboutStat) => {
    if (item) {
      setIsStatEditMode(true);
      setSelectedStat(item);
      setStatForm({
        labelAr: item.labelAr,
        labelEn: item.labelEn,
        valueAr: item.valueAr,
        valueEn: item.valueEn,
        order: item.order ?? 0,
      });
    } else {
      setIsStatEditMode(false);
      setSelectedStat(null);
      setStatForm({ labelAr: "", labelEn: "", valueAr: "", valueEn: "", order: 0 });
    }
    setStatErrors({});
    setIsStatModalOpen(true);
  };

  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!statForm.labelEn) errs.labelEn = "English label is required";
    if (!statForm.labelAr) errs.labelAr = "Arabic label is required";
    if (!statForm.valueEn) errs.valueEn = "English value is required";
    if (!statForm.valueAr) errs.valueAr = "Arabic value is required";
    if (Object.keys(errs).length > 0) {
      setStatErrors(errs);
      return;
    }

    try {
      const payload = {
        labelAr: statForm.labelAr,
        labelEn: statForm.labelEn,
        valueAr: statForm.valueAr,
        valueEn: statForm.valueEn,
        order: statForm.order,
      };
      if (isStatEditMode && selectedStat) {
        await apiService.updateAboutStat(selectedStat.id, payload);
        addToast("Stat updated successfully", "success");
      } else {
        await apiService.createAboutStat(payload);
        addToast("Stat created successfully", "success");
      }
      setIsStatModalOpen(false);
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Operation failed",
        "error"
      );
    }
  };

  const handleDeleteStat = async (id: string) => {
    try {
      await apiService.deleteAboutStat(id);
      addToast("Stat deleted successfully", "success");
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to delete stat",
        "error"
      );
    }
  };

  // ─── Cards handlers ───
  const handleOpenCardModal = (item?: AboutCard) => {
    if (item) {
      setIsCardEditMode(true);
      setSelectedCard(item);
      setCardForm({
        section: item.section,
        titleAr: item.titleAr,
        titleEn: item.titleEn,
        bodyAr: item.bodyAr,
        bodyEn: item.bodyEn,
        iconName: item.iconName || "",
        iconColor: item.iconColor || "",
        order: item.order ?? 0,
        isActive: item.isActive,
      });
    } else {
      setIsCardEditMode(false);
      setSelectedCard(null);
      setCardForm({
        section: "VISION_MISSION",
        titleAr: "",
        titleEn: "",
        bodyAr: "",
        bodyEn: "",
        iconName: "",
        iconColor: "",
        order: 0,
        isActive: true,
      });
    }
    setCardErrors({});
    setIsCardModalOpen(true);
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!cardForm.titleEn) errs.titleEn = "English title is required";
    if (!cardForm.titleAr) errs.titleAr = "Arabic title is required";
    if (!cardForm.bodyEn) errs.bodyEn = "English description is required";
    if (!cardForm.bodyAr) errs.bodyAr = "Arabic description is required";
    if (Object.keys(errs).length > 0) {
      setCardErrors(errs);
      return;
    }

    try {
      const payload = {
        section: cardForm.section,
        titleAr: cardForm.titleAr,
        titleEn: cardForm.titleEn,
        bodyAr: cardForm.bodyAr,
        bodyEn: cardForm.bodyEn,
        iconName: cardForm.iconName || undefined,
        iconColor: cardForm.iconColor || undefined,
        order: cardForm.order,
        isActive: cardForm.isActive,
      };
      if (isCardEditMode && selectedCard) {
        await apiService.updateAboutCard(selectedCard.id, payload);
        addToast("Card updated successfully", "success");
      } else {
        await apiService.createAboutCard(payload);
        addToast("Card created successfully", "success");
      }
      setIsCardModalOpen(false);
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Operation failed",
        "error"
      );
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await apiService.deleteAboutCard(id);
      addToast("Card deleted successfully", "success");
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to delete card",
        "error"
      );
    }
  };

  const handleToggleCardActive = async (item: AboutCard) => {
    try {
      await apiService.updateAboutCard(item.id, { isActive: !item.isActive });
      addToast(
        `Card ${item.isActive ? "deactivated" : "activated"} successfully`,
        "success"
      );
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to update card",
        "error"
      );
    }
  };

  const filteredCards = cards.filter(
    (c) => !cardSectionFilter || c.section === cardSectionFilter
  );

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "config", label: "Page Config", icon: <Settings size={18} /> },
    { key: "stats", label: "Stats", icon: <BarChart3 size={18} /> },
    { key: "cards", label: "Cards", icon: <LayoutGrid size={18} /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">About Page</h1>
          <p className="text-neutral-600 mt-1">
            Manage the About page hero, content, stats, and cards
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
                placeholder="Jawla Tours"
              />
              <Input
                label="Hero Title (Arabic)"
                value={configForm.heroTitleAr}
                onChange={(e) =>
                  setConfigForm({ ...configForm, heroTitleAr: e.target.value })
                }
                placeholder="جولة تورز"
                dir="rtl"
              />
              <Input
                label="Hero Subtitle (English)"
                value={configForm.heroSubtitleEn}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    heroSubtitleEn: e.target.value,
                  })
                }
                placeholder="Your travel partner"
              />
              <Input
                label="Hero Subtitle (Arabic)"
                value={configForm.heroSubtitleAr}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    heroSubtitleAr: e.target.value,
                  })
                }
                placeholder="شريك سفرك"
                dir="rtl"
              />
            </div>
            <hr className="border-neutral-200" />

            <h2 className="text-lg font-semibold text-neutral-900">
              About Section
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="About Title (English)"
                value={configForm.aboutTitleEn}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    aboutTitleEn: e.target.value,
                  })
                }
                placeholder="About Jawla"
              />
              <Input
                label="About Title (Arabic)"
                value={configForm.aboutTitleAr}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    aboutTitleAr: e.target.value,
                  })
                }
                placeholder="عن جولة"
                dir="rtl"
              />
              <Textarea
                label="About Description (English)"
                value={configForm.aboutDescriptionEn}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    aboutDescriptionEn: e.target.value,
                  })
                }
                placeholder="Write about Jawla Tours..."
                className="min-h-28"
              />
              <Textarea
                label="About Description (Arabic)"
                value={configForm.aboutDescriptionAr}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    aboutDescriptionAr: e.target.value,
                  })
                }
                placeholder="اكتب عن جولة تورز..."
                className="min-h-28"
                dir="rtl"
              />
            </div>
            <ImageUpload
              label="About Image"
              value={configForm.aboutImageUrl}
              onChange={(url) =>
                setConfigForm({ ...configForm, aboutImageUrl: url })
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Image Caption (English)"
                value={configForm.aboutImageCaptionEn}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    aboutImageCaptionEn: e.target.value,
                  })
                }
                placeholder="Optional caption"
              />
              <Input
                label="Image Caption (Arabic)"
                value={configForm.aboutImageCaptionAr}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    aboutImageCaptionAr: e.target.value,
                  })
                }
                placeholder="تعليق اختياري"
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

        {/* ─── STATS TAB ─── */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleOpenStatModal()}>
                <Plus size={20} />
                New Stat
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="card p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-2xl font-bold text-primary-600">
                          {stat.valueEn}
                        </p>
                        <p className="text-sm text-neutral-500" dir="rtl">
                          {stat.valueAr}
                        </p>
                        <p className="text-sm text-neutral-700 font-medium mt-1">
                          {stat.labelEn}
                        </p>
                        <p
                          className="text-sm text-neutral-500"
                          dir="rtl"
                        >
                          {stat.labelAr}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenStatModal(stat)}
                        className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} className="text-neutral-600" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: "stat", id: stat.id })}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  {stat.order !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <GripVertical size={12} />
                      Order: {stat.order}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {stats.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-neutral-600">
                  No stats yet. Add stats like &quot;Years of Experience&quot;,
                  &quot;Happy Customers&quot;, etc.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── CARDS TAB ─── */}
        {activeTab === "cards" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <select
                value={cardSectionFilter}
                onChange={(e) => setCardSectionFilter(e.target.value)}
                className="input-base w-full sm:w-56"
              >
                <option value="">All Sections</option>
                {CARD_SECTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button onClick={() => handleOpenCardModal()}>
                <Plus size={20} />
                New Card
              </Button>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Section
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Title (EN)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Title (AR)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((card) => (
                    <tr
                      key={card.id}
                      className="border-t border-neutral-200 hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                          {getSectionLabel(card.section)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        <div className="flex items-center gap-2">
                          {card.iconName && (
                            <span
                              className="text-lg"
                              style={card.iconColor ? { color: card.iconColor } : undefined}
                            >
                              {card.iconName}
                            </span>
                          )}
                          {card.titleEn}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-neutral-700"
                        dir="rtl"
                      >
                        {card.titleAr}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {card.order ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleCardActive(card)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            card.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                          }`}
                        >
                          {card.isActive ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}
                          {card.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenCardModal(card)}
                            className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} className="text-neutral-600" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: "card", id: card.id })}
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

              {filteredCards.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-600">
                    No cards found. Add vision/mission, values, or service cards.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Stat Modal ─── */}
      <Modal
        isOpen={isStatModalOpen}
        onClose={() => setIsStatModalOpen(false)}
        title={isStatEditMode ? "Edit Stat" : "Create New Stat"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsStatModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatSubmit}>
              {isStatEditMode ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleStatSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Label (English)"
              value={statForm.labelEn}
              onChange={(e) =>
                setStatForm({ ...statForm, labelEn: e.target.value })
              }
              error={statErrors.labelEn}
              placeholder="e.g., Years of Experience"
            />
            <Input
              label="Label (Arabic)"
              value={statForm.labelAr}
              onChange={(e) =>
                setStatForm({ ...statForm, labelAr: e.target.value })
              }
              error={statErrors.labelAr}
              placeholder="مثال: سنوات الخبرة"
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Value (English)"
              value={statForm.valueEn}
              onChange={(e) =>
                setStatForm({ ...statForm, valueEn: e.target.value })
              }
              error={statErrors.valueEn}
              placeholder="e.g., 15+ or 10,000"
            />
            <Input
              label="Value (Arabic)"
              value={statForm.valueAr}
              onChange={(e) =>
                setStatForm({ ...statForm, valueAr: e.target.value })
              }
              error={statErrors.valueAr}
              placeholder="مثال: +15 أو 10,000"
              dir="rtl"
            />
          </div>
          <Input
            label="Sort Order"
            type="number"
            value={statForm.order.toString()}
            onChange={(e) =>
              setStatForm({
                ...statForm,
                order: parseInt(e.target.value) || 0,
              })
            }
            placeholder="0"
          />
        </form>
      </Modal>

      {/* ─── Card Modal ─── */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title={isCardEditMode ? "Edit Card" : "Create New Card"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCardModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCardSubmit}>
              {isCardEditMode ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form
          onSubmit={handleCardSubmit}
          className="space-y-4 max-h-[28rem] overflow-y-auto"
        >
          <Select
            label="Section"
            value={cardForm.section}
            onChange={(e) =>
              setCardForm({
                ...cardForm,
                section: e.target.value as AboutCardSection,
              })
            }
          >
            {CARD_SECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={cardForm.titleEn}
              onChange={(e) =>
                setCardForm({ ...cardForm, titleEn: e.target.value })
              }
              error={cardErrors.titleEn}
              placeholder="Card title in English"
            />
            <Input
              label="Title (Arabic)"
              value={cardForm.titleAr}
              onChange={(e) =>
                setCardForm({ ...cardForm, titleAr: e.target.value })
              }
              error={cardErrors.titleAr}
              placeholder="عنوان البطاقة بالعربية"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Body (English)"
              value={cardForm.bodyEn}
              onChange={(e) =>
                setCardForm({ ...cardForm, bodyEn: e.target.value })
              }
              error={cardErrors.bodyEn}
              placeholder="Card body text in English"
              className="min-h-24"
            />
            <Textarea
              label="Body (Arabic)"
              value={cardForm.bodyAr}
              onChange={(e) =>
                setCardForm({ ...cardForm, bodyAr: e.target.value })
              }
              error={cardErrors.bodyAr}
              placeholder="نص البطاقة بالعربية"
              className="min-h-24"
              dir="rtl"
            />
          </div>

          <Input
            label="Icon Name (SVG name or emoji)"
            value={cardForm.iconName}
            onChange={(e) =>
              setCardForm({ ...cardForm, iconName: e.target.value })
            }
            placeholder="e.g., heart, star, or 🎯"
          />

          <Input
            label="Sort Order"
            type="number"
            value={cardForm.order.toString()}
            onChange={(e) =>
              setCardForm({
                ...cardForm,
                order: parseInt(e.target.value) || 0,
              })
            }
            placeholder="0"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cardForm.isActive}
              onChange={(e) =>
                setCardForm({ ...cardForm, isActive: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-neutral-700 font-medium">
              Active (visible on website)
            </span>
          </label>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            if (deleteConfirm.type === "stat") {
              await handleDeleteStat(deleteConfirm.id);
            } else {
              await handleDeleteCard(deleteConfirm.id);
            }
            setDeleteConfirm(null);
          }
        }}
        title={deleteConfirm?.type === "stat" ? "Delete Stat" : "Delete Card"}
        message={
          deleteConfirm?.type === "stat"
            ? "This stat will be permanently removed from the About page. This action cannot be undone."
            : "This card will be permanently removed from the About page. This action cannot be undone."
        }
      />
    </DashboardLayout>
  );
}
