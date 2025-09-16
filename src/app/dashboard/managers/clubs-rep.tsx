"use client";
import { useState, useEffect } from 'react';
import { ImageDropzone } from '@/components/upload/image-dropzone';
import { Users, Building2, Edit, X, Save, Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
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
import type { ClubDoc, ClubHighlight, ClubEvent, ClubContact } from '@/lib/cms/types';
import { updateArrayItem as arrUpdate, removeArrayItem as arrRemove, confirmDelete, updateWithTimestamp } from '@/lib/cms/types';

export function ClubRepManager({ clubId }: { clubId: string }) {
  const [club, setClub] = useState<ClubDoc | null>(null);
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
  const [highlights, setHighlights] = useState<ClubHighlight[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [contact, setContact] = useState<ClubContact>({ email:'', discord:'', instagram:'', website:'', joinForm:'' });
  const [isAdvanced, setIsAdvanced] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClub = async () => {
      const q = query(collection(db, 'clubs'), where('__name__', '==', clubId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data() as Omit<ClubDoc,'id'>;
        setClub({ id: clubId, ...docData });
        setName(docData.name || '');
        setDescription(docData.description || '');
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
      await updateWithTimestamp('clubs', clubId, { name, description, shortDescription, longDescription, members: members === '' ? 0 : members, category, gradient, highlights, events, contact, logoUrl, logoStoragePath: prevLogoPath });
      setClub(c => c ? { ...c, name, description, shortDescription, longDescription, members: members === '' ? 0 : members, category, gradient, highlights, events, contact, logoUrl } : c);
      toast({ title:'Club updated', description:name });
      setIsEditing(false);
    } catch (e:any) {
      toast({ title:'Update failed', description:e.message || 'Error updating club', variant:'destructive' });
    }
  };

  const updateArrayItem = <T,>(list: T[], setter: (v:T[])=>void, index: number, patch: Partial<T>) => {
    setter(arrUpdate(list, index, patch));
  };
  const removeArrayItem = <T,>(list:T[], setter:(v:T[])=>void, index:number) => {
    setter(arrRemove(list, index));
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
                  <div className="space-y-2">
                    <ImageDropzone
                      existingUrl={logoUrl || null}
                      previousPath={prevLogoPath || null}
                      pathPrefix={`clubs/${clubId}/logo-`}
                      description="Drag & drop or click to upload a logo"
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
                <Button type="button" variant="outline" onClick={()=>setIsAdvanced(a=>!a)} className="w-full justify-between">
                  Advanced Fields <ChevronDown className={cn('h-4 w-4 transition-transform', isAdvanced && 'rotate-180')} />
                </Button>
                {isAdvanced && (
                  <div className="space-y-8">
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
                    <div className="spacey-4">
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
    </div>
  );
}
