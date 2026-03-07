"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "input-base w-full resize-vertical min-h-[120px]",
          error && "border-red-500 focus:ring-red-100",
          className
        )}
        {...props}
      />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
      {hint && !error && <p className="text-neutral-500 text-sm mt-1">{hint}</p>}
    </div>
  );
}
