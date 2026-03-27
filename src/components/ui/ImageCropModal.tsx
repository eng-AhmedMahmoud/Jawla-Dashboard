"use client";

import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { ZoomIn, ZoomOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ASPECT_PRESETS = [
  { label: "Free", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
];

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropDone: (croppedFile: File) => void;
  /** Pre-select an aspect ratio (0 = free) */
  defaultAspect?: number;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropDone,
  defaultAspect = 0,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(defaultAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  // Reset state when modal opens with a new image
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAspect(defaultAspect);
      setCroppedAreaPixels(null);
      setApplying(false);
    }
  }, [isOpen, imageSrc, defaultAspect]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const file = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropDone(file);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900/95">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-5 py-3 bg-neutral-800/80 backdrop-blur-sm border-b border-neutral-700/50">
        <h3 className="text-white font-semibold text-base">Crop Image</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* ─── Crop area ─── */}
      <div className="relative flex-1 min-h-0">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect || undefined}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          showGrid
          style={{
            containerStyle: { background: "#171717" },
          }}
        />
      </div>

      {/* ─── Controls ─── */}
      <div className="px-5 py-4 bg-neutral-800/80 backdrop-blur-sm border-t border-neutral-700/50 space-y-4">
        {/* Zoom slider */}
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <ZoomOut size={16} className="text-neutral-400 flex-shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 h-1.5 appearance-none bg-neutral-600 rounded-full outline-none
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:shadow-md"
          />
          <ZoomIn size={16} className="text-neutral-400 flex-shrink-0" />
        </div>

        {/* Aspect ratio presets + Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-neutral-500 font-medium mr-1">
              Ratio:
            </span>
            {ASPECT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setAspect(preset.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  (aspect === preset.value ||
                    (aspect === 0 && preset.value === 0))
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={applying || !croppedAreaPixels}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600
                         disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {applying ? "Applying..." : "Apply Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Utilities ──────────────────────────────────────────────

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"));
          return;
        }
        resolve(
          new File([blob], `cropped-${Date.now()}.jpg`, {
            type: "image/jpeg",
          })
        );
      },
      "image/jpeg",
      0.92
    );
  });
}
