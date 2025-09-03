// Utility helpers for image processing (resize/compress + crop result to blob)
// Uses browser Canvas APIs. No server side processing.
export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0..1 for JPEG/WebP
  mimeType?: string; // e.g. 'image/jpeg' or 'image/webp'
}

export async function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export async function resizeImage(file: File, opts: ResizeOptions = {}): Promise<Blob> {
  const { maxWidth = 512, maxHeight = 512, quality = 0.85, mimeType } = opts;
  const img = await fileToImage(file);
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const targetW = Math.round(img.width * ratio);
  const targetH = Math.round(img.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = targetW; canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(img, 0, 0, targetW, targetH);
  const type = mimeType || (file.type.includes('png') ? 'image/png' : 'image/jpeg');
  return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b as Blob), type, quality));
}

// Crop area comes from react-easy-crop (pixel coordinates)
export interface CropArea { x: number; y: number; width: number; height: number; }

export async function getCroppedCanvasBlob(file: File, crop: CropArea, opts: ResizeOptions = {}): Promise<Blob> {
  const { quality = 0.9, mimeType } = opts;
  const img = await fileToImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = crop.width; canvas.height = crop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  const type = mimeType || 'image/jpeg';
  return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b as Blob), type, quality));
}

export function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: blob.type, lastModified: Date.now() });
}
