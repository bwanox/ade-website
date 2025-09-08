import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

export interface PdfUploadResult { url:string; path:string; title:string; sizeLabel:string }
export interface PdfUploadOptions { maxSizeMB?: number; onProgress?: (pct:number)=>void; replaceOldPath?: string }

export function formatFileSize(bytes:number) { return bytes < 1024*1024 ? `${(bytes/1024).toFixed(1)}KB` : `${(bytes/1024/1024).toFixed(1)}MB`; }

export function validatePdf(file:File, maxSizeMB=15, toast?: (o:any)=>void) {
  if (file.type !== 'application/pdf') { toast?.({ title:'Invalid file', description:'Only PDF allowed', variant:'destructive'}); return false; }
  if (file.size > maxSizeMB*1024*1024) { toast?.({ title:'File too large', description:`Max ${maxSizeMB}MB`, variant:'destructive'}); return false; }
  return true;
}

export async function uploadPdfWithProgress(file:File, path:string, opts:PdfUploadOptions={}):Promise<PdfUploadResult> {
  const storageRef = ref(storage, path);
  return await new Promise((resolve, reject)=>{
    const task = uploadBytesResumable(storageRef, file, { contentType:file.type });
    task.on('state_changed', snap=>{ if(opts.onProgress) opts.onProgress(Math.round((snap.bytesTransferred/snap.totalBytes)*100)); }, err=>reject(err), async ()=>{
      try { const url = await getDownloadURL(storageRef); resolve({ url, path, title: file.name.replace(/\.pdf$/i,''), sizeLabel: formatFileSize(file.size) }); } catch(e){ reject(e); }
    });
  });
}

// React hook wrapper (optional)
export function usePdfUpload() {
  const { toast } = useToast();
  return {
    async upload(file:File, basePath:string, opts:PdfUploadOptions={}) {
      if (!validatePdf(file, opts.maxSizeMB, toast)) return null;
      const safeName = file.name.replace(/\s+/g,'_');
      const path = `${basePath}${Date.now()}-${safeName}`;
      const res = await uploadPdfWithProgress(file, path, opts).catch(e=>{ toast({ title:'Upload failed', description: e?.message || 'Error uploading PDF', variant:'destructive'}); return null; });
      if (res && opts.replaceOldPath && opts.replaceOldPath !== res.path) { try { await deleteObject(ref(storage, opts.replaceOldPath)); } catch {/* ignore */} }
      if (res) toast({ title:'Uploaded', description: res.title });
      return res;
    }
  };
}
