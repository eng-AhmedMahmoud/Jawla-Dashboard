"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Crop,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ImageCropModal } from "./ImageCropModal";

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  /** Default crop aspect ratio (0 = free). E.g. 16/9, 1, 4/3 */
  aspectRatio?: number;
}

export function ImageUpload({
  label,
  value,
  onChange,
  error,
  aspectRatio,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropOpen, setCropOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState("");

  // Show server URL or local preview — resolve relative paths against the API
  const resolveUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `https://back-jawla.tajera.net${url}`;
  };
  const displayUrl = resolveUrl(value) || previewUrl;

  // ── File selection → open cropper ──
  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image must be less than 5MB");
        return;
      }
      setUploadError("");
      const objectUrl = URL.createObjectURL(file);
      setRawImageSrc(objectUrl);
      setCropOpen(true);
    },
    []
  );

  // ── After crop → upload the cropped file ──
  const handleCropDone = useCallback(
    async (croppedFile: File) => {
      setCropOpen(false);

      // Show local preview while uploading
      const localUrl = URL.createObjectURL(croppedFile);
      setPreviewUrl(localUrl);
      setUploading(true);

      try {
        const data = await apiService.uploadImage(croppedFile);
        onChange(data.url);
        setPreviewUrl("");
        URL.revokeObjectURL(localUrl);
      } catch (err: any) {
        setUploadError(
          err.response?.data?.message || "Failed to upload image"
        );
        setPreviewUrl("");
        URL.revokeObjectURL(localUrl);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  // ── Re-crop an existing image ──
  const handleRecrop = useCallback(async () => {
    // If we still have the original source, reuse it
    if (rawImageSrc) {
      setCropOpen(true);
      return;
    }
    // Otherwise fetch the current image as a blob so canvas can read it
    if (displayUrl) {
      try {
        const res = await fetch(displayUrl);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setRawImageSrc(objectUrl);
        setCropOpen(true);
      } catch {
        // Fallback: try using the URL directly (may fail if CORS blocks canvas)
        setRawImageSrc(displayUrl);
        setCropOpen(true);
      }
    }
  }, [rawImageSrc, displayUrl]);

  // ── Drag & drop / file input ──
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange("");
    setPreviewUrl("");
    setUploadError("");
    if (rawImageSrc.startsWith("blob:")) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc("");
  }, [onChange, rawImageSrc]);

  const displayError = error || uploadError;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {displayUrl ? (
        <div className="relative group rounded-lg overflow-hidden border border-neutral-300">
          <img
            src={displayUrl}
            alt="Uploaded"
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/400x200?text=Image+Error";
            }}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 size={32} className="text-white animate-spin" />
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRecrop}
              className="p-2 bg-white rounded-full text-neutral-700 hover:bg-neutral-100 transition-colors"
              title="Crop image"
            >
              <Crop size={18} />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-full text-neutral-700 hover:bg-neutral-100 transition-colors"
              title="Replace image"
            >
              <Upload size={18} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
              title="Remove image"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 h-48 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
            dragOver
              ? "border-primary-500 bg-primary-50"
              : "border-neutral-300 hover:border-neutral-400 bg-neutral-50",
            uploading && "pointer-events-none opacity-70"
          )}
        >
          {uploading ? (
            <>
              <Loader2
                size={32}
                className="text-primary-500 animate-spin"
              />
              <p className="text-sm text-neutral-600">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-neutral-200 rounded-full">
                <ImageIcon size={24} className="text-neutral-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Drag & drop an image here
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  or click to browse (max 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {displayError && (
        <p className="text-red-500 text-sm mt-1">{displayError}</p>
      )}

      {/* Crop modal */}
      <ImageCropModal
        isOpen={cropOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropOpen(false)}
        onCropDone={handleCropDone}
        defaultAspect={aspectRatio}
      />
    </div>
  );
}
