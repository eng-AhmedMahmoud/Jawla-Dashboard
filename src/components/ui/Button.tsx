"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = cn(
    "btn-base inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200",
    fullWidth && "w-full",
    variant === "primary" && "bg-primary-600 text-white hover:bg-primary-700",
    variant === "secondary" &&
      "bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
    variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
    variant === "ghost" && "text-neutral-700 hover:bg-neutral-100",
    size === "sm" && "px-3 py-1.5 text-sm",
    size === "md" && "px-4 py-2.5",
    size === "lg" && "px-6 py-3 text-lg",
    disabled || loading ? "opacity-50 cursor-not-allowed" : "",
    className
  );

  return (
    <button className={baseClasses} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
