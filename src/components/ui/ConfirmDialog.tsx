"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconBg = variant === "danger" ? "bg-red-100" : "bg-amber-100";
  const iconColor = variant === "danger" ? "text-red-600" : "text-amber-600";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-0">
          {/* Icon */}
          <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {variant === "danger" ? (
              <Trash2 size={22} className={iconColor} />
            ) : (
              <AlertTriangle size={22} className={iconColor} />
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-neutral-900 text-center">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-neutral-500 text-center mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3 mt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            fullWidth
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
