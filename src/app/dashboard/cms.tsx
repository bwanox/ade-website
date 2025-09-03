"use client";

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import dynamic from 'next/dynamic';
const EasyCrop = dynamic(() => import('react-easy-crop'), { ssr: false });
import { getCroppedCanvasBlob, resizeImage, blobToFile, CropArea } from '@/components/upload/image-utils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Users, 
  Newspaper, 
  BookOpen,
  Calendar,
  MoreHorizontal,
  Building2,
  ChevronDown
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebase';
import { ref } from 'firebase/storage';
// Removed unused direct upload helpers now handled via shared helper
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { toast as globalToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
// Removed unused import since uploadWithProgress encapsulates this
// import { uploadBytesResumable } from 'firebase/storage';

// REMOVE duplicated helper implementations and import from shared helper file
import { VALID_IMAGE_TYPES, validateImageFile, uploadWithProgress, makeImagePath, CropJob } from '@/components/upload/image-upload-helpers';
// ...existing code...

export function AdminClubManager() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [members, setMembers] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [gradient, setGradient] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [prevLogoPath, setPrevLogoPath] = useState<string>('');
  const [highlights, setHighlights] = useState<any[]>([]);
  const [board, setBoard] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [contact, setContact] = useState<any>({ email: '', discord: '', instagram: '', website: '', joinForm: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const [cropModal, setCropModal] = useState<CropJob | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState<number>(0);
  const [boardProgress, setBoardProgress] = useState<Record<number, number>>({});
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);

  useEffect(()=>{ 
    if (cropModal?.file) { 
      if (cropPreviewUrl) { try { URL.revokeObjectURL(cropPreviewUrl); } catch {} }
      const url = URL.createObjectURL(cropModal.file); 
      setCropPreviewUrl(url); 
      return () => { try { URL.revokeObjectURL(url); } catch {} }; 
    }
  }, [cropModal]);

  const safeStringify = (val: any, fallback: string) => {
    try { return JSON.stringify(val, null, 2); } catch { return fallback; }
  };

  const fetchClubs = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'clubs'));
    setClubs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchClubs(); }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // slug uniqueness (create or when editing and slug changed)
      if (!editingId || (editingId && clubs.find(c => c.id === editingId)?.slug !== slug)) {
        const slugDupSnap = await getDocs(query(collection(db,'clubs'), where('slug','==', slug)));
        if (!editingId && !slug) { toast({ title:'Missing slug', description:'Slug is required', variant:'destructive'}); return; }
        if (!slug) { toast({ title:'Slug required', description:'Provide a unique slug', variant:'destructive'}); return; }
        if (!slugDupSnap.empty && slugDupSnap.docs[0].id !== editingId) { toast({ title:'Duplicate slug', description:'Another club already uses this slug', variant:'destructive'}); return; }
      }
      const baseData: any = {
        name,
        description,
        slug,
        shortDescription: description || shortDescription,
        longDescription,
        members: members === '' ? 0 : members,
        category,
        gradient,
        logoUrl,
        // Always persist storage path (even if logo cleared it will be empty string already)
        logoStoragePath: prevLogoPath,
        highlights,
        board,
        events,
        achievements,
        contact,
        updatedAt: new Date(),
      };
      if (editingId) {
        await updateDoc(doc(db,'clubs', editingId), baseData);
        toast({ title:'Club updated', description:name });
      } else {
        await addDoc(collection(db,'clubs'), { ...baseData, createdAt:new Date() });
        toast({ title:'Club created', description:name });
      }
      // reset
      setName(''); setDescription(''); setSlug(''); setShortDescription(''); setLongDescription(''); setMembers(''); setCategory(''); setGradient('');
      setHighlights([]); setBoard([]); setEvents([]); setAchievements([]); setContact({ email:'', discord:'', instagram:'', website:'', joinForm:'' });
      setLogoUrl(''); setPrevLogoPath(''); setEditingId(null); setShowForm(false); setShowAdvanced(false);
      fetchClubs();
    } catch (err:any) {
      toast({ title:'Error saving club', description: err.message || 'Unexpected error', variant:'destructive' });
    }
  };

  const handleEdit = (club: any) => {
    setEditingId(club.id);
    setName(club.name);
    setDescription(club.description);
    setShowForm(true);
    setSlug(club.slug || '');
    setShortDescription(club.shortDescription || '');
    setLongDescription(club.longDescription || '');
    setMembers(typeof club.members === 'number' ? club.members : '');
    setCategory(club.category || '');
    setGradient(club.gradient || '');
    setLogoUrl(club.logoUrl || '');
    setPrevLogoPath(club.logoStoragePath || '');
    setHighlights(club.highlights || []);
    setBoard(club.board || []);
    setEvents(club.events || []);
    setAchievements(club.achievements || []);
    setContact({ email:'', discord:'', instagram:'', website:'', joinForm:'', ...(club.contact || {}) });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this club?')) {
    await deleteDoc(doc(db, 'clubs', id));
    fetchClubs();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setShowForm(false);
    setSlug(''); setShortDescription(''); setLongDescription(''); setMembers(''); setCategory(''); setGradient('');
    setHighlights([]); setBoard([]); setEvents([]); setAchievements([]); setContact({ email:'', discord:'', instagram:'', website:'', joinForm:'' });
    setLogoUrl('');
    setPrevLogoPath('');
    setShowAdvanced(false);
  };

  const updateArrayItem = (list: any[], setter: (v:any[])=>void, index: number, patch: any) => {
    setter(list.map((item,i)=> i===index ? { ...item, ...patch } : item));
  };
  const removeArrayItem = (list:any[], setter:(v:any[])=>void, index:number) => {
    setter(list.filter((_,i)=>i!==index));
  };

  const handleLogoFile = async (file: File) => {
    if (!validateImageFile(file)) return;
    setCropModal({ file, size:512, pathPrefix:`club_logos/${slug || name || 'club'}-`, onDone: ({url:pathUrl,path})=>{ setLogoUrl(pathUrl); setPrevLogoPath(path); }, previousPath: prevLogoPath, kind:'logo' });
  };

  const performCropUpload = async () => {
    if (!cropModal) return;
    const { file, size, pathPrefix, onDone, previousPath, kind, boardIndex } = cropModal;
    if (!croppedAreaPixels) { setCropModal(null); return; }
    try {
      if (kind === 'logo') setLogoProgress(0); else if (kind==='board' && typeof boardIndex === 'number') setBoardProgress(p=>({...p,[boardIndex]:0}));
      const croppedBlob = await getCroppedCanvasBlob(file, croppedAreaPixels, { quality:0.9, mimeType:'image/jpeg' });
      const croppedFile = blobToFile(croppedBlob, file.name.replace(/\.[^.]+$/, '-crop.jpg'));
      const resizedBlob = await resizeImage(croppedFile, { maxWidth:size, maxHeight:size, quality:0.85, mimeType:'image/jpeg' });
      const finalFile = blobToFile(resizedBlob, 'image.jpg');
      const path = makeImagePath(pathPrefix, (slug || name || 'item'));
      const setPct = (n:number)=> {
        if (kind==='logo') setLogoProgress(n); else if (kind==='board' && typeof boardIndex==='number') setBoardProgress(p=>({...p,[boardIndex!]:n})); };
      const { url, path: storedPath } = await uploadWithProgress(finalFile, path, setPct);
      // delete previous if changed
      if (previousPath && previousPath !== storedPath) { try { const r = ref(storage, previousPath); await import('firebase/storage').then(m=>m.deleteObject(r)); } catch {/* ignore */} }
      onDone({ url, path: storedPath });
      toast({ title: kind==='logo' ? 'Logo uploaded' : 'Avatar uploaded', description: kind==='logo' ? 'Club logo updated' : 'Board member avatar updated' });
    } catch (e:any) {
      toast({ title:'Upload failed', description:e.message || 'Error processing image', variant:'destructive' });
    } finally { setCropModal(null); setLogoProgress(0); setBoardProgress(p=>p); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Manage Clubs
          </h2>
          <p className="text-muted-foreground">Create and manage student clubs</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Club
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Edit Club' : 'Add New Club'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update club information' : 'Create a new student club'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic fields */}
                <div className="space-y-2">
                  <Label htmlFor="club-name">Club Name</Label>
                  <Input id="club-name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter club name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club-slug">Slug</Label>
                  <Input id="club-slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="unique-slug" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="club-description">Short Description</Label>
                  <Textarea id="club-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short summary visible in listings" required rows={2} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="club-short">Long Description</Label>
                  <Textarea id="club-short" value={longDescription} onChange={e => setLongDescription(e.target.value)} placeholder="Full description shown on club page" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club-members">Members</Label>
                  <Input id="club-members" type="number" value={members} onChange={e => setMembers(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club-category">Category</Label>
                  <Input id="club-category" value={category} onChange={e => setCategory(e.target.value)} placeholder="Technology, Social, ..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="club-gradient">Gradient Classes</Label>
                  <Input id="club-gradient" value={gradient} onChange={e => setGradient(e.target.value)} placeholder="from-blue-500 to-cyan-500" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="club-logo">Club Logo</Label>
                  <div onDragOver={e => { e.preventDefault(); }} onDrop={async e => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) await handleLogoFile(file); }} className="flex flex-col gap-3 border border-dashed rounded p-4 items-start">
                    <div className="flex items-center gap-4 w-full">
                      {logoUrl && <img src={logoUrl} alt="logo" className="h-16 w-16 rounded object-cover border" />}
                      <div className="flex flex-col gap-2 flex-1">
                        <Input id="club-logo" type="file" accept="image/*" disabled={uploading} onChange={async (e) => { const file = e.target.files?.[0]; if (file) await handleLogoFile(file); }} />
                        <p className="text-[10px] text-muted-foreground">Drag & drop or choose. JPG/PNG/WebP. Max 2MB.</p>
                        <div className="flex gap-2">
                          {logoUrl && <Button type="button" variant="ghost" size="sm" onClick={() => { setLogoUrl(''); setPrevLogoPath(''); }}>Remove</Button>}
                        </div>
                      </div>
                    </div>
                    {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                    {logoProgress > 0 && <Progress value={logoProgress} className="w-full" />}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button type="button" variant="outline" onClick={() => setShowAdvanced(s => !s)} className="w-full justify-between">
                  Advanced Fields <ChevronDown className={cn('h-4 w-4 transition-transform', showAdvanced && 'rotate-180')} />
                </Button>
                {showAdvanced && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Highlights */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Highlights</Label>
                        <Button type="button" size="sm" variant="secondary" onClick={()=> setHighlights([...highlights, { title:'', description:'' }])}>Add</Button>
                      </div>
                      {highlights.length === 0 && <p className="text-xs text-muted-foreground">No highlights yet.</p>}
                      <div className="space-y-4">
                        {highlights.map((h,i)=>(
                          <div key={i} className="rounded-md border p-4 space-y-2 bg-muted/40">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                              <span>Highlight {i+1}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>removeArrayItem(highlights,setHighlights,i)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <Input placeholder="Title" value={h.title} onChange={e=>updateArrayItem(highlights,setHighlights,i,{title:e.target.value})} />
                            <Textarea placeholder="Description" rows={2} value={h.description} onChange={e=>updateArrayItem(highlights,setHighlights,i,{description:e.target.value})} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Board */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Board Members</Label>
                        <Button type="button" size="sm" variant="secondary" onClick={()=> setBoard([...board, { name:'', role:'', avatar:'', avatarPath:'' }])}>Add</Button>
                      </div>
                      {board.length === 0 && <p className="text-xs text-muted-foreground">No board members yet.</p>}
                      <div className="grid gap-4 md:grid-cols-2">
                        {board.map((m,i)=>(
                          <div key={i} className="rounded-md border p-4 space-y-2 bg-muted/40 relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={()=>removeArrayItem(board,setBoard,i)}><Trash2 className="h-4 w-4" /></Button>
                            <div className="flex items-center gap-3">
                              {m.avatar ? <img src={m.avatar} alt={m.name || 'avatar'} className="h-12 w-12 rounded-full object-cover border" /> : <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">IMG</div>}
                              <div className="flex-1 space-y-2">
                                <Input placeholder="Name" value={m.name} onChange={e=>updateArrayItem(board,setBoard,i,{name:e.target.value})} />
                                <Input placeholder="Role" value={m.role} onChange={e=>updateArrayItem(board,setBoard,i,{role:e.target.value})} />
                                <div className="flex items-center gap-2">
                                  <Input type="file" accept="image/*" className="flex-1" onChange={async (e)=>{ const file=e.target.files?.[0]; if(!file) return; if(!validateImageFile(file)) return; setCropModal({ file, size:256, pathPrefix:`club_board/${slug || name || 'club'}/${i}_`, onDone:({url,path})=>updateArrayItem(board,setBoard,i,{avatar:url, avatarPath:path}), previousPath:m.avatarPath, kind:'board', boardIndex:i }); }} />
                                  {m.avatar && <Button type="button" size="sm" variant="ghost" onClick={()=>{ updateArrayItem(board,setBoard,i,{avatar:'', avatarPath:''}); }}>Clear</Button>}
                                </div>
                                {boardProgress[i] > 0 && <Progress value={boardProgress[i]} className="w-full" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Events */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Events</Label>
                        <Button type="button" size="sm" variant="secondary" onClick={()=> setEvents([...events, { date:'', title:'', description:'', status:'upcoming' }])}>Add</Button>
                      </div>
                      {events.length === 0 && <p className="text-xs text-muted-foreground">No events yet.</p>}
                      <div className="space-y-4">
                        {events.map((ev,i)=>(
                          <div key={i} className="rounded-md border p-4 space-y-2 bg-muted/40">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                              <span>Event {i+1}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>removeArrayItem(events,setEvents,i)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <div className="grid md:grid-cols-4 gap-2">
                              <Input type="date" value={ev.date} onChange={e=>updateArrayItem(events,setEvents,i,{date:e.target.value})} />
                              <Input placeholder="Title" value={ev.title} onChange={e=>updateArrayItem(events,setEvents,i,{title:e.target.value})} />
                              <Input placeholder="Status (upcoming/past/ongoing)" value={ev.status} onChange={e=>updateArrayItem(events,setEvents,i,{status:e.target.value})} />
                              <Input placeholder="Short description" value={ev.description} onChange={e=>updateArrayItem(events,setEvents,i,{description:e.target.value})} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Achievements</Label>
                        <Button type="button" size="sm" variant="secondary" onClick={()=> setAchievements([...achievements, { title:'', description:'', image:'', year:'', highlight:false }])}>Add</Button>
                      </div>
                      {achievements.length === 0 && <p className="text-xs text-muted-foreground">No achievements yet.</p>}
                      <div className="space-y-4">
                        {achievements.map((a,i)=>(
                          <div key={i} className="rounded-md border p-4 space-y-2 bg-muted/40">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                              <span>Achievement {i+1}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>removeArrayItem(achievements,setAchievements,i)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <Input placeholder="Title" value={a.title} onChange={e=>updateArrayItem(achievements,setAchievements,i,{title:e.target.value})} />
                            <Textarea rows={2} placeholder="Description" value={a.description} onChange={e=>updateArrayItem(achievements,setAchievements,i,{description:e.target.value})} />
                            <div className="grid md:grid-cols-3 gap-2 items-center">
                              <Input placeholder="Image URL" value={a.image} onChange={e=>updateArrayItem(achievements,setAchievements,i,{image:e.target.value})} />
                              <Input type="number" placeholder="Year" value={a.year || ''} onChange={e=>updateArrayItem(achievements,setAchievements,i,{year:e.target.value ? Number(e.target.value) : ''})} />
                              <label className="flex items-center gap-2 text-xs"><Checkbox checked={!!a.highlight} onCheckedChange={(v:any)=>updateArrayItem(achievements,setAchievements,i,{highlight: !!v})} /> Featured</label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Contact</Label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Email" value={contact.email} onChange={e=>setContact({ ...contact, email:e.target.value })} />
                        <Input placeholder="Discord URL" value={contact.discord} onChange={e=>setContact({ ...contact, discord:e.target.value })} />
                        <Input placeholder="Instagram URL" value={contact.instagram} onChange={e=>setContact({ ...contact, instagram:e.target.value })} />
                        <Input placeholder="Website URL" value={contact.website} onChange={e=>setContact({ ...contact, website:e.target.value })} />
                        <Input placeholder="Join Form URL" value={contact.joinForm} onChange={e=>setContact({ ...contact, joinForm:e.target.value })} className="md:col-span-2" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update Club' : 'Create Club'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {cropModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-4 space-y-4">
            <h3 className="font-semibold text-sm">Crop Image</h3>
            <div className="relative w-full h-64 bg-muted rounded overflow-hidden">
              {cropModal.file && (
                <EasyCrop
                  image={cropPreviewUrl || ''}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
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
                  onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels as CropArea)}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setCropModal(null); if (cropPreviewUrl) { try { URL.revokeObjectURL(cropPreviewUrl); } catch {}; setCropPreviewUrl(null);} }}>Cancel</Button>
              <Button type="button" size="sm" onClick={async () => { await performCropUpload(); if (cropPreviewUrl) { try { URL.revokeObjectURL(cropPreviewUrl); } catch {}; setCropPreviewUrl(null);} }} disabled={uploading}>{uploading ? 'Uploading...' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Clubs</CardTitle>
          <CardDescription>
            {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clubs yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first club.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Club
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map(club => (
                <Card key={club.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{club.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {club.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(club)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(club.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ClubRepManager({ clubId }: { clubId: string }) {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [members, setMembers] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [gradient, setGradient] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [prevLogoPath, setPrevLogoPath] = useState<string>('');
  const [highlights, setHighlights] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [contact, setContact] = useState<any>({ email:'', discord:'', instagram:'', website:'', joinForm:'' });
  const [isAdvanced, setIsAdvanced] = useState(false);
  const { toast } = useToast();
  const [cropModal, setCropModal] = useState<CropJob | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState<number>(0);
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);

  useEffect(()=>{ 
    if (cropModal?.file) { 
      if (cropPreviewUrl) { try { URL.revokeObjectURL(cropPreviewUrl); } catch {} }
      const url = URL.createObjectURL(cropModal.file); 
      setCropPreviewUrl(url); 
      return () => { try { URL.revokeObjectURL(url); } catch {} }; 
    }
  }, [cropModal]);

  useEffect(() => {
    const fetchClub = async () => {
      const q = query(collection(db, 'clubs'), where('__name__', '==', clubId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data();
        setClub({ id: clubId, ...docData });
        setName(docData.name);
        setDescription(docData.description);
        setShortDescription(docData.shortDescription || '');
        setLongDescription(docData.longDescription || '');
        setMembers(typeof docData.members === 'number' ? docData.members : '');
        setCategory(docData.category || '');
        setGradient(docData.gradient || '');
        setLogoUrl(docData.logoUrl || '');
        setPrevLogoPath(docData.logoStoragePath || '');
        setHighlights(docData.highlights || []);
        setEvents(docData.events || []);
        setContact({ email:'', discord:'', instagram:'', website:'', joinForm:'', ...(docData.contact || {}) });
      }
      setLoading(false);
    };
    fetchClub();
  }, [clubId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'clubs', clubId), { name, description, shortDescription, longDescription, members: members === '' ? 0 : members, category, gradient, highlights, events, contact, logoUrl, logoStoragePath: prevLogoPath });
      setClub({ ...club, name, description, shortDescription, longDescription, members, category, gradient, highlights, events, contact, logoUrl });
      toast({ title:'Club updated', description:name });
      setIsEditing(false);
    } catch (e:any) {
      toast({ title:'Update failed', description:e.message || 'Error updating club', variant:'destructive' });
    }
  };

  const updateArrayItem = (list: any[], setter: (v:any[])=>void, index: number, patch: any) => {
    setter(list.map((item,i)=> i===index ? { ...item, ...patch } : item));
  };
  const removeArrayItem = (list:any[], setter:(v:any[])=>void, index:number) => {
    setter(list.filter((_,i)=>i!==index));
  };

  const handleLogoFile = async (file: File) => { 
    if (!validateImageFile(file)) return; 
    setCropModal({ file, size:512, pathPrefix:`club_logos/${clubId}-`, onDone: ({url, path}) => { setLogoUrl(url); setPrevLogoPath(path); }, previousPath: prevLogoPath, kind:'logo' }); 
  };

  const performCropUpload = async () => {
    if (!cropModal || !croppedAreaPixels) { setCropModal(null); return; }
    try {
      setLogoProgress(0);
      const { file, size, pathPrefix, onDone, previousPath } = cropModal;
      const croppedBlob = await getCroppedCanvasBlob(file, croppedAreaPixels, { quality:0.9, mimeType:'image/jpeg' });
      const croppedFile = blobToFile(croppedBlob, file.name.replace(/\.[^.]+$/, '-crop.jpg'));
      const resizedBlob = await resizeImage(croppedFile, { maxWidth:size, maxHeight:size, quality:0.85, mimeType:'image/jpeg' });
      const finalFile = blobToFile(resizedBlob, 'image.jpg');
      const path = makeImagePath(pathPrefix, clubId);
      const { url, path: storedPath } = await uploadWithProgress(finalFile, path, (n)=>setLogoProgress(n));
      if (previousPath && previousPath !== storedPath) { try { const r = ref(storage, previousPath); await import('firebase/storage').then(m=>m.deleteObject(r)); } catch {} }
      onDone({ url, path: storedPath });
      toast({ title:'Logo uploaded', description:'Club logo updated' });
    } catch (e:any) { toast({ title:'Upload failed', description: e.message || 'Error processing image', variant:'destructive' }); }
    finally { setCropModal(null); setLogoProgress(0); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!club) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Club not found</h3>
          <p className="text-muted-foreground">The club you're trying to manage doesn't exist.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
          <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            My Club
          </h2>
          <p className="text-muted-foreground">Manage your club information</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          {isEditing ? 'Cancel' : 'Edit Club'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {club.name}
          </CardTitle>
          <CardDescription>Club ID: {clubId}</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="club-name">Club Name</Label>
                  <Input
                    id="club-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter club name"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="club-description">Short Description</Label>
                  <Textarea
                    id="club-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Short summary visible in listings"
                    required
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="club-short">Long Description</Label>
                  <Textarea
                    id="club-short"
                    value={longDescription}
                    onChange={e => setLongDescription(e.target.value)}
                    placeholder="Full description shown on club page"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club-members">Members</Label>
                  <Input
                    id="club-members"
                    type="number"
                    value={members}
                    onChange={e => setMembers(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club-category">Category</Label>
                  <Input
                    id="club-category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Technology, Social, ..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="club-gradient">Gradient Classes</Label>
                  <Input
                    id="club-gradient"
                    value={gradient}
                    onChange={e => setGradient(e.target.value)}
                    placeholder="from-blue-500 to-cyan-500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="club-logo-edit">Club Logo</Label>
                  <div className="flex items-center gap-4 flex-wrap">
                    {logoUrl && <img src={logoUrl} alt="logo" className="h-16 w-16 rounded object-cover border" />}
                    <Input id="club-logo-edit" type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; if (!validateImageFile(file)) return; setCropModal({ file, size:512, pathPrefix:`club_logos/${clubId}-`, onDone: ({url, path}) => { setLogoUrl(url); setPrevLogoPath(path); }, previousPath: prevLogoPath, kind:'logo' }); }} />
                    {logoUrl && <Button type="button" variant="ghost" size="sm" onClick={() => { setLogoUrl(''); setPrevLogoPath(''); }}>Remove</Button>}
                  </div>
                  {logoProgress > 0 && <Progress value={logoProgress} className="w-full" />}
                </div>
              </div>
              <div className="space-y-3">
                <Button type="button" variant="outline" onClick={()=>setIsAdvanced(a=>!a)} className="w-full justify-between">
                  Advanced Fields <ChevronDown className={cn('h-4 w-4 transition-transform', isAdvanced && 'rotate-180')} />
                </Button>
                {isAdvanced && (
                  <div className="space-y-8">
                    {/* Highlights */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Highlights</Label>
                        <Button type="button" size="sm" variant="secondary" onClick={()=> setHighlights([...highlights, { title:'', description:'' }])}>Add</Button>
                      </div>
                      {highlights.length === 0 && <p className="text-xs text-muted-foreground">No highlights yet.</p>}
                      <div className="space-y-4">
                        {highlights.map((h,i)=>(
                          <div key={i} className="rounded-md border p-4 space-y-2 bg-muted/40">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                              <span>Highlight {i+1}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>removeArrayItem(highlights,setHighlights,i)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <Input placeholder="Title" value={h.title} onChange={e=>updateArrayItem(highlights,setHighlights,i,{title:e.target.value})} />
                            <Textarea rows={2} placeholder="Description" value={h.description} onChange={e=>updateArrayItem(highlights,setHighlights,i,{description:e.target.value})} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Events */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Events</Label>
                        <Button type="button" size="sm" variant="secondary" onClick={()=> setEvents([...events, { date:'', title:'', description:'', status:'upcoming' }])}>Add</Button>
                      </div>
                      {events.length === 0 && <p className="text-xs text-muted-foreground">No events yet.</p>}
                      <div className="space-y-4">
                        {events.map((ev,i)=>(
                          <div key={i} className="rounded-md border p-4 space-y-2 bg-muted/40">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                              <span>Event {i+1}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>removeArrayItem(events,setEvents,i)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <div className="grid md:grid-cols-4 gap-2">
                              <Input type="date" value={ev.date} onChange={e=>updateArrayItem(events,setEvents,i,{date:e.target.value})} />
                              <Input placeholder="Title" value={ev.title} onChange={e=>updateArrayItem(events,setEvents,i,{title:e.target.value})} />
                              <Input placeholder="Status" value={ev.status} onChange={e=>updateArrayItem(events,setEvents,i,{status:e.target.value})} />
                              <Input placeholder="Short description" value={ev.description} onChange={e=>updateArrayItem(events,setEvents,i,{description:e.target.value})} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Contact */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Contact</Label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Email" value={contact.email} onChange={e=>setContact({ ...contact, email:e.target.value })} />
                        <Input placeholder="Discord URL" value={contact.discord} onChange={e=>setContact({ ...contact, discord:e.target.value })} />
                        <Input placeholder="Instagram URL" value={contact.instagram} onChange={e=>setContact({ ...contact, instagram:e.target.value })} />
                        <Input placeholder="Website URL" value={contact.website} onChange={e=>setContact({ ...contact, website:e.target.value })} />
                        <Input placeholder="Join Form URL" value={contact.joinForm} onChange={e=>setContact({ ...contact, joinForm:e.target.value })} className="md:col-span-2" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Club Name</Label>
                <p className="text-lg font-semibold">{club.name}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{club.description}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Club Logo</Label>
                {club.logoUrl ? <img src={club.logoUrl} alt="logo" className="h-20 w-20 rounded object-cover border mt-2" /> : <p className="text-xs text-muted-foreground mt-1">No logo uploaded.</p>}
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ID: {clubId}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {cropModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-4 space-y-4">
            <h3 className="font-semibold text-sm">Crop Image</h3>
            <div className="relative w-full h-64 bg-muted rounded overflow-hidden">
              {cropModal.file && (
                <EasyCrop
                  image={cropPreviewUrl || ''}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
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
                  onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels as CropArea)}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setCropModal(null); if (cropPreviewUrl) { try { URL.revokeObjectURL(cropPreviewUrl); } catch {}; setCropPreviewUrl(null);} }}>Cancel</Button>
              <Button type="button" size="sm" onClick={async () => { await performCropUpload(); if (cropPreviewUrl) { try { URL.revokeObjectURL(cropPreviewUrl); } catch {}; setCropPreviewUrl(null);} }} disabled={uploading}>{uploading ? 'Uploading...' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminNewsManager() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'news'));
    setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(()=>{ fetchArticles(); },[]);

  const reset = () => { setEditingId(null); setHeadline(''); setSummary(''); setContent(''); setCategory(''); setImage(''); setPublished(false); setFeatured(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const base:any = { headline, summary, content, category, image, published, featured, updatedAt: new Date() };
    if (editingId) await updateDoc(doc(db,'news',editingId), base); else await addDoc(collection(db,'news'), { ...base, createdAt:new Date() });
    reset(); setShowForm(false); fetchArticles();
  };
  const handleEdit = (a:any) => { setEditingId(a.id); setHeadline(a.headline||''); setSummary(a.summary||''); setContent(a.content||''); setCategory(a.category||''); setImage(a.image||''); setPublished(!!a.published); setFeatured(!!a.featured); setShowForm(true); };
  const handleDelete = async (id:string) => { if(confirm('Delete article?')) { await deleteDoc(doc(db,'news',id)); fetchArticles(); } };

  return <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold flex items-center gap-2"><Newspaper className="h-5 w-5"/>Manage News</h3>
        <p className="text-sm text-muted-foreground">Publish campus & club updates</p>
      </div>
      <Button onClick={()=>{ reset(); setShowForm(true); }} size="sm" className="flex items-center gap-2"><Plus className="h-4 w-4"/>New</Button>
    </div>
    {showForm && <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">{editingId? 'Edit Article':'Create Article'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Headline</Label><Input value={headline} onChange={e=>setHeadline(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Category</Label><Input value={category} onChange={e=>setCategory(e.target.value)} placeholder="General" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Summary</Label><Textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={2} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Image URL</Label><Input value={image} onChange={e=>setImage(e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-2 md:col-span-2"><Label>Content (Markdown / Text)</Label><Textarea value={content} onChange={e=>setContent(e.target.value)} rows={6} /></div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2"><Checkbox checked={published} onCheckedChange={(v:any)=>setPublished(!!v)} /> Published</label>
            <label className="flex items-center gap-2"><Checkbox checked={featured} onCheckedChange={(v:any)=>setFeatured(!!v)} /> Featured</label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="gap-1"><Save className="h-4 w-4"/>{editingId? 'Update':'Publish'}</Button><Button type="button" variant="outline" size="sm" onClick={()=>{ setShowForm(false); reset(); }}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>}

    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">All Articles</CardTitle>
        <CardDescription>{articles.length} total</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-8 w-full"/> )}</div> : articles.length===0 ? <p className="text-xs text-muted-foreground">No articles yet.</p> : <div className="space-y-4">
          {articles.map(a=> <div key={a.id} className="p-3 border rounded-md flex flex-col gap-2 bg-muted/40">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium text-sm flex items-center gap-2">{a.headline}{a.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{a.summary}</p>
                <div className="flex gap-2 text-[10px] text-muted-foreground flex-wrap">
                  {a.category && <span className="px-1.5 py-0.5 bg-background border rounded">{a.category}</span>}
                  {a.published ? <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded">Published</span> : <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">Draft</span>}
                </div>
              </div>
              <div className="flex gap-1 items-start">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>handleEdit(a)}><Edit className="h-4 w-4"/></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={()=>handleDelete(a.id)}><Trash2 className="h-4 w-4"/></Button>
              </div>
            </div>
          </div>)}
        </div>}
      </CardContent>
    </Card>
  </div>;
}
export function ClubRepNewsManager({ clubId }: { clubId: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    const q = query(collection(db,'news'), where('clubId','==', clubId));
    const snap = await getDocs(q);
    setArticles(snap.docs.map(d=> ({ id:d.id, ...d.data()} )));
    setLoading(false);
  };
  useEffect(()=>{ fetchArticles(); },[clubId]);

  const reset = () => { setEditingId(null); setHeadline(''); setSummary(''); setContent(''); setCategory(''); setImage(''); };
  const handleSubmit = async (e:React.FormEvent) => { e.preventDefault(); const base:any = { headline, summary, content, category, image, clubId, published:false, featured:false, updatedAt:new Date() }; if (editingId) await updateDoc(doc(db,'news',editingId), base); else await addDoc(collection(db,'news'), { ...base, createdAt:new Date() }); reset(); setShowForm(false); fetchArticles(); };
  const handleEdit = (a:any) => { setEditingId(a.id); setHeadline(a.headline||''); setSummary(a.summary||''); setContent(a.content||''); setCategory(a.category||''); setImage(a.image||''); setShowForm(true); };
  const handleDelete = async (id:string) => { if(confirm('Delete article?')) { await deleteDoc(doc(db,'news',id)); fetchArticles(); } };

  return <div className="space-y-6"><div className="flex items-center justify-between"><div className="space-y-1"><h3 className="text-xl font-semibold flex items-center gap-2"><Newspaper className="h-5 w-5"/>My Club News</h3><p className="text-sm text-muted-foreground">Draft and submit club updates</p></div><Button onClick={()=>{ reset(); setShowForm(true); }} size="sm" className="flex items-center gap-2"><Plus className="h-4 w-4"/>New</Button></div>{showForm && <Card><CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2">{editingId?'Edit':'Create'} Article</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4"><div className="grid gap-4"><div className="space-y-2"><Label>Headline</Label><Input value={headline} onChange={e=>setHeadline(e.target.value)} required /></div><div className="space-y-2"><Label>Category</Label><Input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Announcements" /></div><div className="space-y-2"><Label>Summary</Label><Textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={2} /></div><div className="space-y-2"><Label>Image URL</Label><Input value={image} onChange={e=>setImage(e.target.value)} placeholder="https://..." /></div><div className="space-y-2"><Label>Content</Label><Textarea value={content} onChange={e=>setContent(e.target.value)} rows={6} /></div></div><div className="flex gap-2"><Button type="submit" size="sm" className="gap-1"><Save className="h-4 w-4"/>{editingId?'Update':'Save Draft'}</Button><Button type="button" variant="outline" size="sm" onClick={()=>{ setShowForm(false); reset(); }}>Cancel</Button></div></form></CardContent></Card>}<Card><CardHeader><CardTitle className="text-sm font-semibold">My Articles</CardTitle><CardDescription>{articles.length} total</CardDescription></CardHeader><CardContent>{loading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-8 w-full"/> )}</div> : articles.length===0 ? <p className="text-xs text-muted-foreground">No drafts yet.</p> : <div className="space-y-4">{articles.map(a=> <div key={a.id} className="p-3 border rounded-md flex flex-col gap-2 bg-muted/40"><div className="flex items-start justify-between"><div className="space-y-1"><h4 className="font-medium text-sm flex items-center gap-2">{a.headline}</h4><p className="text-[11px] text-muted-foreground line-clamp-2">{a.summary}</p></div><div className="flex gap-1 items-start"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>handleEdit(a)}><Edit className="h-4 w-4"/></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={()=>handleDelete(a.id)}><Trash2 className="h-4 w-4"/></Button></div></div></div>)}</div>}</CardContent></Card></div>;
}
export function AdminCoursesManager() {
  const [courseDocs, setCourseDocs] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [title, setTitle] = useState(''); 
  const [slug, setSlug] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [difficulty, setDifficulty] = useState(''); 
  const [duration, setDuration] = useState(''); 
  const [year, setYear] = useState<number | ''>(''); 
  const [heroImage, setHeroImage] = useState(''); 
  const [showForm, setShowForm] = useState(false); 
  const { toast } = useToast();

  const fetchCourses = async () => { 
    setLoading(true); 
    const snap = await getDocs(collection(db,'courses')); 
    setCourseDocs(snap.docs.map(d=>({ id:d.id, ...d.data()}))); 
    setLoading(false); 
  }; 

  useEffect(()=>{ fetchCourses(); },[]); 

  const reset = () => { 
    setEditingId(null); 
    setTitle(''); 
    setSlug(''); 
    setDescription(''); 
    setDifficulty(''); 
    setDuration(''); 
    setYear(''); 
    setHeroImage(''); 
  }; 

  const handleSubmit = async (e:React.FormEvent) => { 
    e.preventDefault(); 
    try {
      // slug uniqueness check
      if (!editingId || (editingId && courseDocs.find(c=>c.id===editingId)?.slug !== slug)) {
        if (!slug) { toast({ title:'Slug required', description:'Provide a unique slug', variant:'destructive'}); return; }
        const dupSnap = await getDocs(query(collection(db,'courses'), where('slug','==', slug)));
        if (!dupSnap.empty && dupSnap.docs[0].id !== editingId) { toast({ title:'Duplicate slug', description:'Another course already uses this slug', variant:'destructive'}); return; }
      }
      const base:any = { title, slug, description, difficulty, duration, year: year === ''? undefined: year, heroImage };
      if (editingId) { await updateDoc(doc(db,'courses',editingId), base); toast({ title:'Course updated', description:title }); }
      else { await addDoc(collection(db,'courses'), base); toast({ title:'Course created', description:title }); }
      reset(); setShowForm(false); fetchCourses();
    } catch (err:any) { toast({ title:'Error saving course', description: err.message || 'Unexpected error', variant:'destructive'}); }
  }; 

  const handleEdit = (c:any) => { 
    setEditingId(c.id); 
    setTitle(c.title||''); 
    setSlug(c.slug||''); 
    setDescription(c.description||''); 
    setDifficulty(c.difficulty||''); 
    setDuration(c.duration||''); 
    setYear(c.year||''); 
    setHeroImage(c.heroImage||''); 
    setShowForm(true); 
  }; 

  const handleDelete = async (id:string) => { 
    if(confirm('Delete course?')) { 
      await deleteDoc(doc(db,'courses', id)); 
      fetchCourses(); 
    } 
  };

  return <div className="space-y-6"><div className="flex items-center justify-between"><div className="space-y-1"><h3 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5"/>Manage Courses</h3><p className="text-sm text-muted-foreground">Academic or training courses</p></div><Button size="sm" className="flex items-center gap-2" onClick={()=>{ reset(); setShowForm(true); }}><Plus className="h-4 w-4"/>New</Button></div>{showForm && <Card><CardHeader><CardTitle className="text-sm font-semibold">{editingId?'Edit':'Create'} Course</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e=>setTitle(e.target.value)} required /></div><div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={e=>setSlug(e.target.value)} required /></div><div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} /></div><div className="space-y-2"><Label>Difficulty</Label><Input value={difficulty} onChange={e=>setDifficulty(e.target.value)} placeholder="Beginner" /></div><div className="space-y-2"><Label>Duration</Label><Input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="8 weeks" /></div><div className="space-y-2"><Label>Year</Label><Input type="number" value={year} onChange={e=>setYear(e.target.value===''?'': Number(e.target.value))} /></div><div className="space-y-2 md:col-span-2"><Label>Hero Image URL</Label><Input value={heroImage} onChange={e=>setHeroImage(e.target.value)} placeholder="https://..." /></div></div><div className="flex gap-2"><Button type="submit" size="sm" className="gap-1"><Save className="h-4 w-4"/>{editingId?'Update':'Save'}</Button><Button type="button" size="sm" variant="outline" onClick={()=>{ setShowForm(false); reset(); }}>Cancel</Button></div></form></CardContent></Card>}{/* list */}<Card><CardHeader><CardTitle className="text-sm font-semibold">All Courses</CardTitle><CardDescription>{courseDocs.length} total</CardDescription></CardHeader><CardContent>{loading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-8 w-full"/> )}</div> : courseDocs.length===0 ? <p className="text-xs text-muted-foreground">No courses yet.</p> : <div className="space-y-4">{courseDocs.map(c=> <div key={c.id} className="p-3 border rounded-md bg-muted/40 flex flex-col gap-2"><div className="flex items-start justify-between"><div className="space-y-1"><h4 className="font-medium text-sm flex items-center gap-2">{c.title}</h4><p className="text-[11px] text-muted-foreground line-clamp-2">{c.description}</p><div className="flex gap-2 text-[10px] text-muted-foreground flex-wrap">{c.difficulty && <span className="px-1.5 py-0.5 bg-background border rounded">{c.difficulty}</span>}{c.duration && <span className="px-1.5 py-0.5 bg-background border rounded">{c.duration}</span>}{c.year && <span className="px-1.5 py-0.5 bg-background border rounded">Year {c.year}</span>}</div></div><div className="flex gap-1 items-start"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>handleEdit(c)}><Edit className="h-4 w-4"/></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={()=>handleDelete(c.id)}><Trash2 className="h-4 w-4"/></Button></div></div></div>)}</div>}</CardContent></Card></div>;
}
export function ClubRepCoursesManager({ clubId }: { clubId: string }) { return <div className="text-xs text-muted-foreground">No course permissions for club rep.</div>; }