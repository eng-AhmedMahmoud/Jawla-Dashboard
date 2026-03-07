"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({
  label,
  error,
  hint,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          "input-base w-full",
          error && "border-red-500 focus:ring-red-100",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-error text-sm mt-1">{error}</p>}
      {hint && !error && <p className="text-neutral-500 text-sm mt-1">{hint}</p>}
    </div>
  );
}
