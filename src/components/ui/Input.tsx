"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "input-base w-full",
            icon && "pl-10",
            error && "border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-error text-sm mt-1">{error}</p>}
      {hint && !error && <p className="text-neutral-500 text-sm mt-1">{hint}</p>}
    </div>
  );
}
