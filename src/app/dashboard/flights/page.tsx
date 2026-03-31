"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { FlightsConfig, FlightsWhyCard } from "@/types";
import { useEffect, useState } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  Save,
  Settings,
  LayoutGrid,
  Eye,
  EyeOff,
  GripVertical,
  MapPin,
} from "lucide-react";

type ActiveTab = "config" | "why-cards" | "popular-routes";

export default function FlightsPageManagement() {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("config");
  const [loading, setLoading] = useState(true);

  // Config state
  const [config, setConfig] = useState<FlightsConfig | null>(null);
  const [configForm, setConfigForm] = useState({
    heroTitleAr: "",
    heroTitleEn: "",
    heroSubtitleAr: "",
    heroSubtitleEn: "",
    heroImageUrl: "",
    whyTitleAr: "",
    whyTitleEn: "",
    whyCardsLimit: 4,
  });
  const [configSaving, setConfigSaving] = useState(false);

  // Why Cards state
  const [whyCards, setWhyCards] = useState<FlightsWhyCard[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCardEditMode, setIsCardEditMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FlightsWhyCard | null>(null);
  const [cardForm, setCardForm] = useState({
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Popular Routes state
  const [popularRoutes, setPopularRoutes] = useState<any[]>([]);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [routeForm, setRouteForm] = useState({
    titleAr: "",
    titleEn: "",
    price: 0,
    currency: "EGP",
    isFeatured: true,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [configData, cardsData, routesData] = await Promise.all([
        apiService.getFlightsConfig(),
        apiService.getFlightsWhyCardsAdmin(),
        apiService.getFlightsPopularRoutes(),
      ]);
      if (configData) {
        setConfig(configData);
        setConfigForm({
          heroTitleAr: configData.heroTitleAr || "",
          heroTitleEn: configData.heroTitleEn || "",
          heroSubtitleAr: configData.heroSubtitleAr || "",
          heroSubtitleEn: configData.heroSubtitleEn || "",
          heroImageUrl: configData.heroImageUrl || "",
          whyTitleAr: configData.whyTitleAr || "",
          whyTitleEn: configData.whyTitleEn || "",
          whyCardsLimit: configData.whyCardsLimit ?? 4,
        });
      }
      setWhyCards(Array.isArray(cardsData) ? cardsData : []);
      setPopularRoutes(Array.isArray(routesData) ? routesData : []);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to load Flights page data",
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
        if (key === "whyCardsLimit") {
          payload[key] = val;
        } else {
          payload[key] = val || null;
        }
      }
      await apiService.updateFlightsConfig(payload);
      addToast("Flights page config updated successfully", "success");
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

  // ─── Why Card handlers ───
  const handleOpenCardModal = (item?: FlightsWhyCard) => {
    if (item) {
      setIsCardEditMode(true);
      setSelectedCard(item);
      setCardForm({
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
    if (!cardForm.bodyEn) errs.bodyEn = "English body is required";
    if (!cardForm.bodyAr) errs.bodyAr = "Arabic body is required";
    if (Object.keys(errs).length > 0) {
      setCardErrors(errs);
      return;
    }

    try {
      const payload = {
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
        await apiService.updateFlightsWhyCard(selectedCard.id, payload);
        addToast("Why card updated successfully", "success");
      } else {
        await apiService.createFlightsWhyCard(payload);
        addToast("Why card created successfully", "success");
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
      await apiService.deleteFlightsWhyCard(id);
      addToast("Why card deleted successfully", "success");
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to delete card",
        "error"
      );
    }
  };

  const handleToggleCardActive = async (item: FlightsWhyCard) => {
    try {
      await apiService.updateFlightsWhyCard(item.id, {
        isActive: !item.isActive,
      });
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

  // ─── Popular Route handlers ───
  const handleOpenRouteModal = (route: any) => {
    setSelectedRoute(route);
    setRouteForm({
      titleAr: route.titleAr || "",
      titleEn: route.titleEn || "",
      price: Math.round(route.price) || 0,
      currency: route.currency || "EGP",
      isFeatured: route.isFeatured ?? true,
    });
    setIsRouteModalOpen(true);
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;
    try {
      await apiService.updateFlightsPopularRoute(selectedRoute.id, routeForm);
      addToast("Route updated successfully", "success");
      setIsRouteModalOpen(false);
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to update route",
        "error"
      );
    }
  };

  const handleToggleRouteFeatured = async (route: any) => {
    try {
      await apiService.updateFlightsPopularRoute(route.id, {
        isFeatured: !route.isFeatured,
      });
      addToast(
        `Route ${route.isFeatured ? "hidden from" : "shown on"} flights page`,
        "success"
      );
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to update route",
        "error"
      );
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
    { key: "config", label: "Page Config", icon: <Settings size={18} /> },
    { key: "why-cards", label: "Why Cards", icon: <LayoutGrid size={18} /> },
    { key: "popular-routes", label: "Popular Routes", icon: <MapPin size={18} /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Flights Page</h1>
          <p className="text-neutral-600 mt-1">
            Manage the Flights page hero, content, and &quot;Why Book With
            Us&quot; cards
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
                placeholder="Flight Booking"
              />
              <Input
                label="Hero Title (Arabic)"
                value={configForm.heroTitleAr}
                onChange={(e) =>
                  setConfigForm({ ...configForm, heroTitleAr: e.target.value })
                }
                placeholder="حجز الطيران"
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
                placeholder="Book your flight at the best prices"
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
                placeholder="احجز رحلتك بأفضل الأسعار"
                dir="rtl"
              />
            </div>
            <ImageUpload
              label="Hero Image"
              value={configForm.heroImageUrl}
              onChange={(url) =>
                setConfigForm({ ...configForm, heroImageUrl: url })
              }
            />

            <hr className="border-neutral-200" />

            <h2 className="text-lg font-semibold text-neutral-900">
              Why Section
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Section Title (English)"
                value={configForm.whyTitleEn}
                onChange={(e) =>
                  setConfigForm({ ...configForm, whyTitleEn: e.target.value })
                }
                placeholder="Why Book With Us?"
              />
              <Input
                label="Section Title (Arabic)"
                value={configForm.whyTitleAr}
                onChange={(e) =>
                  setConfigForm({ ...configForm, whyTitleAr: e.target.value })
                }
                placeholder="لماذا تحجز معنا؟"
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

        {/* ─── WHY CARDS TAB ─── */}
        {activeTab === "why-cards" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleOpenCardModal()}>
                <Plus size={20} />
                New Why Card
              </Button>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Icon
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
                  {whyCards.map((card) => (
                    <tr
                      key={card.id}
                      className="border-t border-neutral-200 hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4">
                        {card.iconName && (
                          <span
                            className="text-lg font-medium"
                            style={
                              card.iconColor
                                ? { color: card.iconColor }
                                : undefined
                            }
                          >
                            {card.iconName}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {card.titleEn}
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-neutral-700"
                        dir="rtl"
                      >
                        {card.titleAr}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <GripVertical size={12} />
                          {card.order}
                        </div>
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
                            onClick={() => setDeleteConfirm(card.id)}
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

              {whyCards.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-600">
                    No &quot;Why Book With Us&quot; cards yet. Add cards like
                    &quot;Best Price Guarantee&quot;, &quot;24/7 Support&quot;,
                    etc.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ─── POPULAR ROUTES TAB ─── */}
        {activeTab === "popular-routes" && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              These are your existing packages shown as popular routes on the
              Flights page. Edit their details or toggle featured visibility.
            </p>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Title (EN)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Title (AR)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Featured
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {popularRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className="border-t border-neutral-200 hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {route.titleEn}
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-neutral-700"
                        dir="rtl"
                      >
                        {route.titleAr}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 font-medium">
                        {route.price?.toLocaleString()} {route.currency || "EGP"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleRouteFeatured(route)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            route.isFeatured
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                          }`}
                        >
                          {route.isFeatured ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}
                          {route.isFeatured ? "Featured" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenRouteModal(route)}
                          className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} className="text-neutral-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {popularRoutes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-600">
                    No packages found. Create packages first, then they will
                    appear here as popular routes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Route Edit Modal ─── */}
      <Modal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        title="Edit Popular Route"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsRouteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRouteSubmit}>Update</Button>
          </>
        }
      >
        <form
          onSubmit={handleRouteSubmit}
          className="space-y-4 max-h-[28rem] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={routeForm.titleEn}
              onChange={(e) =>
                setRouteForm({ ...routeForm, titleEn: e.target.value })
              }
              placeholder="Saudi Arabia Trips"
            />
            <Input
              label="Title (Arabic)"
              value={routeForm.titleAr}
              onChange={(e) =>
                setRouteForm({ ...routeForm, titleAr: e.target.value })
              }
              placeholder="رحلات المملكة العربية السعودية"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              value={routeForm.price.toString()}
              onChange={(e) =>
                setRouteForm({
                  ...routeForm,
                  price: parseInt(e.target.value) || 0,
                })
              }
              placeholder="2500"
            />
            <Input
              label="Currency"
              value={routeForm.currency}
              onChange={(e) =>
                setRouteForm({ ...routeForm, currency: e.target.value })
              }
              placeholder="EGP"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={routeForm.isFeatured}
              onChange={(e) =>
                setRouteForm({ ...routeForm, isFeatured: e.target.checked })
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-neutral-700 font-medium">
              Featured (visible on flights page)
            </span>
          </label>
        </form>
      </Modal>

      {/* ─── Why Card Modal ─── */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title={isCardEditMode ? "Edit Why Card" : "Create New Why Card"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={cardForm.titleEn}
              onChange={(e) =>
                setCardForm({ ...cardForm, titleEn: e.target.value })
              }
              error={cardErrors.titleEn}
              placeholder="Best Price Guarantee"
            />
            <Input
              label="Title (Arabic)"
              value={cardForm.titleAr}
              onChange={(e) =>
                setCardForm({ ...cardForm, titleAr: e.target.value })
              }
              error={cardErrors.titleAr}
              placeholder="ضمان أفضل سعر"
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
              placeholder="We guarantee the best prices..."
              className="min-h-24"
            />
            <Textarea
              label="Body (Arabic)"
              value={cardForm.bodyAr}
              onChange={(e) =>
                setCardForm({ ...cardForm, bodyAr: e.target.value })
              }
              error={cardErrors.bodyAr}
              placeholder="نضمن أفضل الأسعار..."
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
            await handleDeleteCard(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Why Card"
        message="This card will be permanently removed from the Flights page. This action cannot be undone."
      />
    </DashboardLayout>
  );
}
