"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  recipeId: string;
  currentImagePath?: string | null;
  onSuccess: (imagePath: string) => void;
}

export function ImageUpload({ recipeId, currentImagePath, onSuccess }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImagePath ?? null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onSuccess(data.imagePath);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setPreview(currentImagePath ?? null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
          <Image src={preview} alt="Recipe preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className="aspect-video max-w-md rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">Click to upload image</p>
          <p className="text-xs text-gray-300">JPEG, PNG, WebP · max 5MB</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {!preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Choose image"}
        </Button>
      )}
    </div>
  );
}
