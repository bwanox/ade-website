// Centralized image upload helpers (validation, upload with progress, path generation, crop job type)
// Extracted from cms.tsx to reduce duplication and enable reuse across CMS managers.
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast as globalToast } from '@/hooks/use-toast';

// Allowed image mime types for uploads
export const VALID_IMAGE_TYPES = ['image/jpeg','image/png','image/webp'];

// Validate file type & size (<=2MB). Emits toast on failure.
export function validateImageFile(file: File) {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    globalToast({ title: 'Invalid file type', description: 'Only JPEG, PNG, or WebP allowed', variant: 'destructive' });
    return false;
  }
  if (file.size > 2 * 1024 * 1024) {
    globalToast({ title: 'File too large', description: 'Max size is 2MB', variant: 'destructive' });
    return false;
  }
  return true;
}

// Perform a resumable upload while emitting progress percentage via provided setter
export async function uploadWithProgress(resizedFile: File, path: string, setPct?: (n:number)=>void) {
  return await new Promise<{url:string; path:string}>((resolve, reject)=>{
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, resizedFile, { contentType: resizedFile.type });
    task.on('state_changed', snap => {
      if (setPct) setPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
    }, err => { reject(err); }, async () => {
      try { const url = await getDownloadURL(storageRef); resolve({ url, path }); } catch(e) { reject(e); }
    });
  });
}

// Storage path builder adds a randomized suffix to avoid collisions
export function makeImagePath(prefix: string, slugOrId: string, ext='jpg') {
  return `${prefix}${slugOrId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}

// Shared crop job interface used by cropping modal logic
export interface CropJob { 
  file: File; 
  size: number; 
  pathPrefix: string; 
  onDone: (info:{url:string; path:string})=>void; 
  previousPath?: string; 
  kind: 'logo' | 'board'; 
  boardIndex?: number; 
}
