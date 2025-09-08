"use client";
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useImageUpload } from '@/lib/cms/useImageUpload';
import { CropArea } from '@/components/upload/image-utils';
import React from 'react';

const EasyCrop = dynamic(()=> import('react-easy-crop'), { ssr:false });

export interface ImageCropDialogProps {
  open: boolean;
  title?: string;
  aspect?: number; // default 1 (square)
  onClose: () => void;
  // Provide hook instance so dialog stays pure/presentational
  uploader: ReturnType<typeof useImageUpload>;
}

export function ImageCropDialog({ open, title = 'Crop Image', aspect = 1, onClose, uploader }: ImageCropDialogProps) {
  const { cropModal, cropPreviewUrl, crop, zoom, setCrop, setZoom, setCroppedAreaPixels, performCropUpload, uploading, closeCrop } = uploader;
  const handleCancel = () => { closeCrop(); onClose(); };
  const titleId = 'image-crop-title';
  const descId = 'image-crop-desc';
  return (
    <Dialog open={open && !!cropModal} onOpenChange={v=> { if(!v) handleCancel(); }}>
      <DialogContent className="p-4 gap-4" aria-labelledby={titleId} aria-describedby={descId}>
        <DialogHeader>
          <DialogTitle id={titleId} className="text-sm font-semibold">{title}</DialogTitle>
          <DialogDescription id={descId} className="text-xs text-muted-foreground">Use arrow keys to adjust the crop position. Zoom with slider or mouse wheel. Press Escape to cancel.</DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-64 bg-muted rounded overflow-hidden" role="group" aria-label="Image crop area">
          {cropModal?.file && (
            <EasyCrop
              image={cropPreviewUrl || ''}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              rotation={0}
              minZoom={1}
              maxZoom={3}
              cropShape="rect"
              showGrid={false}
              objectFit="contain"
              restrictPosition
              zoomWithScroll
              zoomSpeed={1}
              keyboardStep={5}
              style={{}}
              classes={{}}
              mediaProps={{}}
              cropperProps={{}}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels)=> setCroppedAreaPixels(pixels as CropArea)}
            />
          )}
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Zoom">
          <label htmlFor="crop-zoom" className="text-[11px] text-muted-foreground">Zoom</label>
          <input id="crop-zoom" aria-describedby="crop-zoom-help" aria-label="Zoom level" type="range" min={1} max={3} step={0.1} value={zoom} onChange={e=> setZoom(Number(e.target.value))} className="flex-1" />
        </div>
        <p id="crop-zoom-help" className="visually-hidden">Adjust zoom to refine the crop selection.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={handleCancel} autoFocus={!uploading}>Cancel</Button>
          <Button type="button" size="sm" onClick={performCropUpload} disabled={uploading} aria-live="polite" aria-busy={uploading}>{uploading? 'Uploading...':'Save'}</Button>
        </div>
        <div aria-live="polite" className="sr-only">{uploading ? 'Uploading cropped image' : 'Idle'}</div>
      </DialogContent>
    </Dialog>
  );
}
