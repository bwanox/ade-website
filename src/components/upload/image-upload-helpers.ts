// Centralized image upload helpers (validation, upload with progress, path generation, crop job type)
// Extracted from cms.tsx to reduce duplication and enable reuse across CMS managers.
import { storage, auth } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast as globalToast } from '@/hooks/use-toast';

// Allowed image mime types for uploads
export const VALID_IMAGE_TYPES = ['image/jpeg','image/png','image/webp'];

// Validate file type & size (<=10MB). Emits toast on failure.
export function validateImageFile(file: File) {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    globalToast({ title: 'Invalid file type', description: 'Only JPEG, PNG, or WebP allowed', variant: 'destructive' });
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    globalToast({ title: 'File too large', description: 'Max size is 10MB', variant: 'destructive' });
    return false;
  }
  return true;
}

// Debug helper to gather auth/token info
async function getDebugAuthInfo() {
  const u = auth.currentUser;
  if (!u) return { signedIn: false };
  try {
    const tokenResult = await u.getIdTokenResult(false);
    return {
      signedIn: true,
      uid: u.uid,
      providerData: u.providerData.map(p=>({providerId:p.providerId, uid:p.uid})),
      claims: tokenResult.claims,
      authTime: tokenResult.authTime,
      issuedAtTime: tokenResult.issuedAtTime,
      expirationTime: tokenResult.expirationTime
    };
  } catch (e:any) {
    return { signedIn: true, uid: u.uid, tokenFetchError: e?.message };
  }
}

function logDebug(prefix: string, data: any) {
  // Centralized logging prefix so user can filter easily
  // eslint-disable-next-line no-console
  console.log(`[UploadDebug] ${prefix}`, data);
}

// Perform a resumable upload while emitting progress percentage via provided setter
export async function uploadWithProgress(resizedFile: File, path: string, setPct?: (n:number)=>void) {
  const debugStartTime = performance.now();
  const bucket = (storage as any)?._location?.bucket || storage.app?.options?.storageBucket;
  const authInfo = await getDebugAuthInfo();
  logDebug('Starting upload', {
    path,
    bucket,
    file: { name: resizedFile.name, type: resizedFile.type, size: resizedFile.size },
    origin: typeof window !== 'undefined' ? window.location.origin : 'ssr',
    authInfo
  });
  try {
    const storageRef = ref(storage, path);
    logDebug('Created ref', { fullPath: storageRef.fullPath, bucket: storageRef.bucket });
    const task = uploadBytesResumable(storageRef, resizedFile, { contentType: resizedFile.type });
    task.on('state_changed', snap => {
      const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      if (setPct) setPct(pct);
      if (pct === 0 || pct === 50 || pct === 100 || pct % 25 === 0) {
        logDebug('Progress', { pct, bytesTransferred: snap.bytesTransferred, totalBytes: snap.totalBytes, state: snap.state });
      }
    }, err => { 
      logDebug('Error event', { name: err.name, code: (err as any)?.code, message: err.message, stack: err.stack });
    }, async () => {
      try { 
        const url = await getDownloadURL(storageRef); 
        const tookMs = Math.round(performance.now() - debugStartTime);
        logDebug('Completed', { url, path: storageRef.fullPath, tookMs });
      } catch (e:any) { 
        logDebug('GetDownloadURLError', { message: e.message, code: e.code });
      }
    });
    // Wrap promise resolution to also return url when finished (as before)
    return await new Promise<{url:string; path:string}>((resolve, reject)=>{
      task.on('state_changed', ()=>{}, (err)=>{ reject(err); }, async ()=>{
        try { const url = await getDownloadURL(storageRef); resolve({ url, path }); } catch(e) { reject(e); }
      });
    });
  } catch (outer:any) {
    logDebug('Outer try/catch error', { message: outer.message, code: outer.code, stack: outer.stack });
    throw outer;
  }
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
  kind: 'logo' | 'board' | 'image' | 'hero'; 
  boardIndex?: number; 
}
