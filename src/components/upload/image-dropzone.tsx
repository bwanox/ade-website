"use client";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { validateImageFile, uploadWithProgress, makeImagePath } from "@/components/upload/image-upload-helpers";
import { storage } from "@/lib/firebase";
import { ref, deleteObject } from "firebase/storage";

export interface ImageDropzoneProps {
  disabled?: boolean;
  existingUrl?: string | null;
  previousPath?: string | null;
  pathPrefix: string; // e.g. `course_hero/my-slug-`
  label?: string;
  description?: string;
  className?: string;
  onUploaded: (r: { url: string; path: string }) => void;
}

function extFromMime(type: string) {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  return "jpg"; // default
}

export function ImageDropzone({ disabled, existingUrl, previousPath, pathPrefix, label, description, className, onUploaded }: ImageDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    if (disabled) return;
    const file = acceptedFiles?.[0];
    if (!file) return;
    if (!validateImageFile(file)) {
      setError("Invalid image. Use JPG/PNG/WebP up to 10MB.");
      return;
    }
    try {
      setUploading(true);
      setProgress(0);
      const base = file.name.replace(/\.[^.]+$/, "");
      const ext = extFromMime(file.type);
      const path = makeImagePath(pathPrefix, base, ext);
      const { url, path: storedPath } = await uploadWithProgress(file, path, (pct) => setProgress(pct));
      // delete previous, if any and changed
      if (previousPath && previousPath !== storedPath) {
        try { await deleteObject(ref(storage, previousPath)); } catch {}
      }
      onUploaded({ url, path: storedPath });
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [disabled, pathPrefix, previousPath, onUploaded]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    multiple: false,
    disabled,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
  });

  const rejectionError = useMemo(() => {
    if (!fileRejections?.length) return null;
    const err = fileRejections[0].errors[0];
    if (!err) return null;
    if (err.code === "file-too-large") return "File too large (max 10MB).";
    if (err.code === "file-invalid-type") return "Unsupported file type.";
    return err.message || "File rejected.";
  }, [fileRejections]);

  return (
    <div className={cn("w-full", className)}>
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      <div
        {...getRootProps({
          className: cn(
            "border border-dashed rounded-md p-4 bg-muted/30 focus:outline-none",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            isDragActive && "ring-2 ring-primary/50"
          ),
        })}
      >
        <input {...getInputProps()} />
        <div className="flex items-start gap-4">
          {existingUrl ? (
            <img src={existingUrl} alt="preview" className="h-24 w-36 object-cover rounded border" />
          ) : (
            <div className="h-24 w-36 rounded border bg-background/50 flex items-center justify-center text-[11px] text-muted-foreground">
              No image
            </div>
          )}
          <div className="flex-1 space-y-2 text-[12px]">
            <p className="text-muted-foreground">
              {isDragActive ? "Drop the image here…" : "Drag & drop an image here, or click to select."}
            </p>
            <p className="text-[10px] text-muted-foreground">JPG/PNG/WebP up to 10MB.</p>
            {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
            <div className="flex items-center gap-2 min-h-5">
              {uploading && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">Uploading…</span>}
              {existingUrl && !uploading && <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">Image added</span>}
              {existingUrl && !uploading && (
                <Button type="button" size="sm" variant="ghost" className="h-7" onClick={(e)=>{ e.preventDefault(); /* clear handled by parent via onUploaded if needed */ }}>
                  Replace by clicking
                </Button>
              )}
            </div>
            {uploading && <Progress value={progress} className="h-2" />}
            {(error || rejectionError) && (
              <p className="text-xs text-destructive">{error || rejectionError}</p>
            )}
            {disabled && <p className="text-xs text-destructive">Enter a slug first to enable image upload.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
