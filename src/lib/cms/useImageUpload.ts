"use client";
import { useState, useCallback } from 'react';
import { ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { validateImageFile, uploadWithProgress, makeImagePath, CropJob } from '@/components/upload/image-upload-helpers';
import { getCroppedCanvasBlob, resizeImage, blobToFile, CropArea } from '@/components/upload/image-utils';
import { useToast } from '@/hooks/use-toast';

export interface UseImageUploadOptions {
  onUploaded?: (result: { url:string; path:string }) => void;
  size?: number; // square resize target
  kind?: string; // for toast messaging
}

interface StartCropArgs {
  file: File;
  size?: number;
  pathPrefix: string;
  previousPath?: string;
  kind?: string;
  boardIndex?: number;
  onDone?: (r:{url:string; path:string})=>void;
}

const IMAGE_LIMITS = { maxMB: 10, maxDimension: 4096 }; // simple constants; can externalize

export function useImageUpload() {
  const { toast } = useToast();
  const [cropModal, setCropModal] = useState<CropJob | null>(null);
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [crop, setCrop] = useState({ x:0, y:0 });
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const revokePreview = () => { if (cropPreviewUrl) { try { URL.revokeObjectURL(cropPreviewUrl); } catch {} } };

  const startCrop = useCallback((args:StartCropArgs) => {
    if (args.file.size > IMAGE_LIMITS.maxMB * 1024 * 1024) { toast({ title:'File too large', description:`Max ${IMAGE_LIMITS.maxMB}MB`, variant:'destructive'}); return; }
    if (!validateImageFile(args.file)) return;
    revokePreview();
    const url = URL.createObjectURL(args.file);
    setCropPreviewUrl(url);
    setCropModal({
      file: args.file,
      size: args.size || 512,
      pathPrefix: args.pathPrefix,
      previousPath: args.previousPath,
      kind: (args.kind as any) || 'image',
      boardIndex: args.boardIndex,
      onDone: ({url, path}) => { args.onDone?.({url,path}); },
    });
  }, []);

  const performCropUpload = useCallback(async () => {
    if (!cropModal || !croppedAreaPixels) { setCropModal(null); return; }
    const { file, size, pathPrefix, onDone, previousPath, kind, boardIndex } = cropModal;
    try {
      setUploading(true);
      const croppedBlob = await getCroppedCanvasBlob(file, croppedAreaPixels, { quality:0.9, mimeType:'image/jpeg' });
      const croppedFile = blobToFile(croppedBlob, file.name.replace(/\.[^.]+$/, '-crop.jpg'));
      const resizedBlob = await resizeImage(croppedFile, { maxWidth:size, maxHeight:size, quality:0.85, mimeType:'image/jpeg' });
      const finalFile = blobToFile(resizedBlob, 'image.jpg');
      const path = makeImagePath(pathPrefix, file.name.replace(/\.[^.]+$/, ''));
      const key = `${kind || 'image'}-${boardIndex ?? 'x'}`;
      setProgressMap(p=>({...p,[key]:0}));
      const { url, path: storedPath } = await uploadWithProgress(finalFile, path, pct=> setProgressMap(p=>({...p,[key]:pct})));
      if (previousPath && previousPath !== storedPath) { try { const r = ref(storage, previousPath); await import('firebase/storage').then(m=>m.deleteObject(r)); } catch {} }
      onDone?.({ url, path: storedPath });
      toast({ title: kind==='logo' ? 'Logo uploaded' : 'Image uploaded', description: file.name });
    } catch (e:any) {
      toast({ title:'Upload failed', description: e.message || 'Error processing image', variant:'destructive'});
    } finally {
      setUploading(false);
      // Clear progress key so UI can hide progress bar
      try {
        const key = `${cropModal?.kind || 'image'}-${cropModal?.boardIndex ?? 'x'}`;
        setProgressMap(p=>{ const c={...p}; delete c[key]; return c; });
      } catch {}
      setCropModal(null);
      setCroppedAreaPixels(null);
      revokePreview();
    }
  }, [cropModal, croppedAreaPixels]);

  return {
    // state
    cropModal, cropPreviewUrl, crop, zoom, uploading, progressMap, croppedAreaPixels,
    // setters
    setCrop, setZoom, setCroppedAreaPixels,
    // actions
    startCrop, performCropUpload,
    // cleanup
    closeCrop: ()=> { revokePreview(); setCropModal(null); },
  };
}
