"use client";

import { useAppStore } from "@/store/useAppStore";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect } from "react";

export function Toast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

function ToastItem({ id, message, type, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-300",
    error: "bg-red-50 border-red-300",
    warning: "bg-yellow-50 border-yellow-300",
    info: "bg-blue-50 border-blue-300",
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${bgColors[type]} animate-in slide-in-from-bottom-5`}
    >
      <div className={iconColors[type]}>{icons[type]}</div>
      <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`text-neutral-400 hover:text-neutral-600 flex-shrink-0`}
      >
        <X size={18} />
      </button>
    </div>
  );
}
