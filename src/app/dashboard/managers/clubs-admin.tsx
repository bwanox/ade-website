"use client";

import { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Users, Calendar, ChevronDown
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { ClubDoc, ClubBoardMember, ClubEvent, ClubAchievement, ClubHighlight, ClubContact } from '@/lib/cms/types';
import { updateArrayItem as arrUpdate, removeArrayItem as arrRemove } from '@/lib/cms/types';
import { confirmDelete, createWithTimestamps, updateWithTimestamp, ensureUniqueSlug } from '@/lib/cms/types';
import { ImageDropzone } from '@/components/upload/image-dropzone';
import { clubSchema, validateOrThrow } from '@/lib/cms/validation';

export function AdminClubManager() {
  const [clubs, setClubs] = useState<ClubDoc[]>([]);
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
  const [highlights, setHighlights] = useState<ClubHighlight[]>([]);
  const [board, setBoard] = useState<ClubBoardMember[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [achievements, setAchievements] = useState<ClubAchievement[]>([]);
  const [contact, setContact] = useState<ClubContact>({ email: '', discord: '', instagram: '', website: '', joinForm: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  // Image uploads handled via ImageDropzone component

  const fetchClubs = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'clubs'));
    setClubs(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<ClubDoc,'id'>) })));
    setLoading(false);
  };

  useEffect(() => { fetchClubs(); }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingId || (editingId && clubs.find(c => c.id === editingId)?.slug !== slug)) {
        if (!slug) { toast({ title:'Slug required', description:'Provide a unique slug', variant:'destructive'}); return; }
        const unique = await ensureUniqueSlug('clubs', slug, editingId || undefined);
        if (!unique) { toast({ title:'Duplicate slug', description:'Another club already uses this slug', variant:'destructive'}); return; }
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
        logoStoragePath: prevLogoPath,
        highlights,
        board,
        events,
        achievements,
        contact,
        updatedAt: new Date(),
      };
      // validate
      try { validateOrThrow(clubSchema, baseData, 'club'); } catch (vErr:any) { toast({ title:'Validation failed', description: vErr.message, variant:'destructive'}); return; }
      if (editingId) {
        await updateWithTimestamp('clubs', editingId, baseData);
        toast({ title:'Club updated', description:name });
      } else {
        await createWithTimestamps('clubs', baseData);
        toast({ title:'Club created', description:name });
      }
      setName(''); setDescription(''); setSlug(''); setShortDescription(''); setLongDescription(''); setMembers(''); setCategory(''); setGradient('');
      setHighlights([]); setBoard([]); setEvents([]); setAchievements([]); setContact({ email:'', discord:'', instagram:'', website:'', joinForm:'' });
      setLogoUrl(''); setPrevLogoPath(''); setEditingId(null); setShowForm(false); setShowAdvanced(false);
      fetchClubs();
    } catch (err:any) {
      toast({ title:'Error saving club', description: err.message || 'Unexpected error', variant:'destructive' });
    }
  };

  const handleEdit = (club: ClubDoc) => {
    setEditingId(club.id);
    setName(club.name);
    setDescription(club.description || '');
    setShowForm(true);
    setSlug(club.slug || '');
    setShortDescription(club.shortDescription || '');
    setLongDescription(club.longDescription || '');
    setMembers(typeof club.members === 'number' ? club.members : '');
    setCategory(club.category || '');
    setGradient(club.gradient || '');
    setLogoUrl(club.logoUrl || '');
    setPrevLogoPath((club as any).logoStoragePath || '');
    setHighlights(club.highlights || []);
    setBoard(club.board || []);
    setEvents(club.events || []);
    setAchievements((club as any).achievements || []);
    setContact({ email:'', discord:'', instagram:'', website:'', joinForm:'', ...(club.contact || {}) });
  };

  const handleDelete = async (id: string) => {
    await confirmDelete('Are you sure you want to delete this club?', async ()=>{ await deleteDoc(doc(db, 'clubs', id)); fetchClubs(); });
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

  const updateArrayItem = <T,>(list: T[], setter: (v:T[])=>void, index: number, patch: Partial<T>) => {
    setter(arrUpdate(list, index, patch));
  };
  const removeArrayItem = <T,>(list:T[], setter:(v:T[])=>void, index:number) => {
    setter(arrRemove(list, index));
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
                  <div className="space-y-2">
                    <ImageDropzone
                      disabled={!slug}
                      existingUrl={logoUrl}
                      previousPath={prevLogoPath}
                      pathPrefix={`club_logos/${slug}-`}
                      onUploaded={({ url, path }) => { setLogoUrl(url); setPrevLogoPath(path); }}
                    />
                    {logoUrl && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setLogoUrl(''); setPrevLogoPath(''); }}>
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button type="button" variant="outline" onClick={() => setShowAdvanced(s => !s)} className="w-full justify-between">
                  Advanced Fields <ChevronDown className={cn('h-4 w-4 transition-transform', showAdvanced && 'rotate-180')} />
                </Button>
                {showAdvanced && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
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

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Board Members</Label>
                        <Button type="button" size="sm" variant="secondary" onClick={()=> setBoard([...board, { name:'', role:'', avatar:'', avatarPath:'', linkedin:'' }])}>Add</Button>
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
                                <Input placeholder="LinkedIn URL (optional)" value={m.linkedin || ''} onChange={e=>updateArrayItem(board,setBoard,i,{linkedin:e.target.value})} />
                                <div className="space-y-2">
                                  <ImageDropzone
                                    disabled={!slug}
                                    existingUrl={m.avatar}
                                    previousPath={m.avatarPath}
                                    pathPrefix={`club_board/${slug}/${i}_`}
                                    onUploaded={({ url, path }) => updateArrayItem(board, setBoard, i, { avatar: url, avatarPath: path })}
                                  />
                                  {m.avatar && (
                                    <Button type="button" size="sm" variant="ghost" onClick={()=>{ updateArrayItem(board,setBoard,i,{avatar:'', avatarPath:''}); }}>
                                      Remove Photo
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

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

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Achievements</Label>
                        <Button type="button" size="sm" variant="secondary" onClick={()=> setAchievements([...achievements, { title:'', description:'', image:'', imagePath:'', year:'', highlight:false }])}>Add</Button>
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
                            <div className="grid md:grid-cols-3 gap-2 items-start">
                              <div className="space-y-2">
                                <ImageDropzone
                                  disabled={!slug}
                                  existingUrl={a.image}
                                  previousPath={(a as any).imagePath}
                                  pathPrefix={`club_achievements/${slug}/${i}_`}
                                  onUploaded={({ url, path }) => updateArrayItem(achievements, setAchievements, i, { image: url, imagePath: path })}
                                />
                                {a.image && (
                                  <Button type="button" size="sm" variant="ghost" onClick={()=>updateArrayItem(achievements,setAchievements,i,{ image:'', imagePath:'' })}>
                                    Remove Image
                                  </Button>
                                )}
                              </div>
                              <Input type="number" placeholder="Year" value={a.year || ''} onChange={e=>updateArrayItem(achievements,setAchievements,i,{year:e.target.value ? Number(e.target.value) : ''})} />
                              <label className="flex items-center gap-2 text-xs"><Checkbox checked={!!a.highlight} onCheckedChange={(v:any)=>updateArrayItem(achievements,setAchievements,i,{highlight: !!v})} /> Featured</label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

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
