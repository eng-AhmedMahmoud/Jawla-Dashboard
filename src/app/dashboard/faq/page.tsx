"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAppStore } from "@/store/useAppStore";
import { apiService } from "@/lib/api";
import { FaqConfig, FaqItem } from "@/types";
import { useEffect, useState } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  Save,
  Settings,
  List,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

type ActiveTab = "config" | "items";

export default function FaqPageManagement() {
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("config");
  const [loading, setLoading] = useState(true);

  // Config state
  const [config, setConfig] = useState<FaqConfig | null>(null);
  const [configForm, setConfigForm] = useState({
    heroTitleAr: "",
    heroTitleEn: "",
    heroSubtitleAr: "",
    heroSubtitleEn: "",
    heroIconUrl: "",
  });
  const [configSaving, setConfigSaving] = useState(false);

  // Items state
  const [items, setItems] = useState<FaqItem[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isItemEditMode, setIsItemEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FaqItem | null>(null);
  const [itemForm, setItemForm] = useState({
    questionAr: "",
    questionEn: "",
    answerAr: "",
    answerEn: "",
    order: 0,
    isActive: true,
  });
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [configData, itemsData] = await Promise.all([
        apiService.getFaqConfig(),
        apiService.getFaqItemsAdmin(),
      ]);
      if (configData) {
        setConfig(configData);
        setConfigForm({
          heroTitleAr: configData.heroTitleAr || "",
          heroTitleEn: configData.heroTitleEn || "",
          heroSubtitleAr: configData.heroSubtitleAr || "",
          heroSubtitleEn: configData.heroSubtitleEn || "",
          heroIconUrl: configData.heroIconUrl || "",
        });
      }
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to load FAQ page data",
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
      await apiService.updateFaqConfig(payload);
      addToast("FAQ page config updated successfully", "success");
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

  // ─── Items handlers ───
  const handleOpenItemModal = (item?: FaqItem) => {
    if (item) {
      setIsItemEditMode(true);
      setSelectedItem(item);
      setItemForm({
        questionAr: item.questionAr,
        questionEn: item.questionEn,
        answerAr: item.answerAr,
        answerEn: item.answerEn,
        order: item.order ?? 0,
        isActive: item.isActive,
      });
    } else {
      setIsItemEditMode(false);
      setSelectedItem(null);
      setItemForm({
        questionAr: "",
        questionEn: "",
        answerAr: "",
        answerEn: "",
        order: items.length + 1,
        isActive: true,
      });
    }
    setItemErrors({});
    setIsItemModalOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!itemForm.questionEn) errs.questionEn = "English question is required";
    if (!itemForm.questionAr) errs.questionAr = "Arabic question is required";
    if (!itemForm.answerEn) errs.answerEn = "English answer is required";
    if (!itemForm.answerAr) errs.answerAr = "Arabic answer is required";
    if (Object.keys(errs).length > 0) {
      setItemErrors(errs);
      return;
    }

    try {
      const payload = {
        questionAr: itemForm.questionAr,
        questionEn: itemForm.questionEn,
        answerAr: itemForm.answerAr,
        answerEn: itemForm.answerEn,
        order: itemForm.order,
        isActive: itemForm.isActive,
      };
      if (isItemEditMode && selectedItem) {
        await apiService.updateFaqItem(selectedItem.id, payload);
        addToast("FAQ item updated successfully", "success");
      } else {
        await apiService.createFaqItem(payload);
        addToast("FAQ item created successfully", "success");
      }
      setIsItemModalOpen(false);
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Operation failed",
        "error"
      );
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await apiService.deleteFaqItem(id);
      addToast("FAQ item deleted successfully", "success");
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to delete FAQ item",
        "error"
      );
    }
  };

  const handleToggleItemActive = async (item: FaqItem) => {
    try {
      await apiService.updateFaqItem(item.id, { isActive: !item.isActive });
      addToast(
        `FAQ item ${item.isActive ? "deactivated" : "activated"} successfully`,
        "success"
      );
      fetchAll();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to update FAQ item",
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
    { key: "items", label: "FAQ Items", icon: <List size={18} /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">FAQ Page</h1>
          <p className="text-neutral-600 mt-1">
            Manage the FAQ page hero section and question items
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
                placeholder="Frequently Asked Questions"
              />
              <Input
                label="Hero Title (Arabic)"
                value={configForm.heroTitleAr}
                onChange={(e) =>
                  setConfigForm({ ...configForm, heroTitleAr: e.target.value })
                }
                placeholder="الأسئلة الشائعة"
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
                placeholder="We are here to help"
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
                placeholder="نحن هنا للمساعدة"
                dir="rtl"
              />
            </div>
            <Input
              label="Hero Icon (Lucide icon name)"
              value={configForm.heroIconUrl}
              onChange={(e) =>
                setConfigForm({ ...configForm, heroIconUrl: e.target.value })
              }
              placeholder="e.g., help-circle"
            />

            <div className="flex justify-end pt-4">
              <Button onClick={handleConfigSave} disabled={configSaving}>
                <Save size={18} />
                {configSaving ? "Saving..." : "Save Config"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── ITEMS TAB ─── */}
        {activeTab === "items" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleOpenItemModal()}>
                <Plus size={20} />
                New FAQ Item
              </Button>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Question (EN)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Question (AR)
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
                  {items
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-neutral-200 hover:bg-neutral-50"
                      >
                        <td className="px-6 py-4 text-sm text-neutral-500">
                          <div className="flex items-center gap-1">
                            <GripVertical size={14} className="text-neutral-400" />
                            {item.order}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700 max-w-xs">
                          <p className="truncate">{item.questionEn}</p>
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-neutral-700 max-w-xs"
                          dir="rtl"
                        >
                          <p className="truncate">{item.questionAr}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleItemActive(item)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              item.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                            }`}
                          >
                            {item.isActive ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}
                            {item.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenItemModal(item)}
                              className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} className="text-neutral-600" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(item.id)}
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

              {items.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-600">
                    No FAQ items yet. Add questions and answers that will appear
                    on the FAQ page.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Item Modal ─── */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={isItemEditMode ? "Edit FAQ Item" : "Create New FAQ Item"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsItemModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleItemSubmit}>
              {isItemEditMode ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form
          onSubmit={handleItemSubmit}
          className="space-y-4 max-h-[28rem] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Question (English)"
              value={itemForm.questionEn}
              onChange={(e) =>
                setItemForm({ ...itemForm, questionEn: e.target.value })
              }
              error={itemErrors.questionEn}
              placeholder="e.g., How can I book?"
            />
            <Input
              label="Question (Arabic)"
              value={itemForm.questionAr}
              onChange={(e) =>
                setItemForm({ ...itemForm, questionAr: e.target.value })
              }
              error={itemErrors.questionAr}
              placeholder="مثال: كيف يمكنني الحجز؟"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Answer (English)"
              value={itemForm.answerEn}
              onChange={(e) =>
                setItemForm({ ...itemForm, answerEn: e.target.value })
              }
              error={itemErrors.answerEn}
              placeholder="Answer in English..."
              className="min-h-28"
            />
            <Textarea
              label="Answer (Arabic)"
              value={itemForm.answerAr}
              onChange={(e) =>
                setItemForm({ ...itemForm, answerAr: e.target.value })
              }
              error={itemErrors.answerAr}
              placeholder="الإجابة بالعربية..."
              className="min-h-28"
              dir="rtl"
            />
          </div>

          <Input
            label="Sort Order"
            type="number"
            value={itemForm.order.toString()}
            onChange={(e) =>
              setItemForm({
                ...itemForm,
                order: parseInt(e.target.value) || 0,
              })
            }
            placeholder="0"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={itemForm.isActive}
              onChange={(e) =>
                setItemForm({ ...itemForm, isActive: e.target.checked })
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
            await handleDeleteItem(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Delete FAQ Item"
        message="This FAQ item will be permanently removed. This action cannot be undone."
      />
    </DashboardLayout>
  );
}
