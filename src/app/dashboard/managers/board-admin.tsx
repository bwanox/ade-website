"use client";
import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { confirmDelete, createWithTimestamps, updateWithTimestamp } from '@/lib/cms/types';
import { ImageDropzone } from '@/components/upload/image-dropzone';

interface BoardMember { id?:string; name:string; role:string; email:string; phone:string; imageUrl:string; imagePath?:string; order:number; linkedin?:string; _temp?:boolean }

export function AdminBoardManager() {
  // Required roles removed; admins can add any roles they want.
  const REQUIRED_ROLES: string[] = [];
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BoardMember | null>(null);
  const { toast } = useToast();
  // Using ImageDropzone instead of cropper

  const fetchMembers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db,'board_members'));
    const docs = snap.docs.map(d=>({ id:d.id, ...(d.data() as any) })) as BoardMember[];
    docs.sort((a,b)=> (a.order ?? 0) - (b.order ?? 0));
    setMembers(docs);
    setLoading(false);
  };
  useEffect(()=>{ fetchMembers(); },[]);

  const reset = () => { setEditing(null); setShowForm(false); };
  const startEdit = (m:BoardMember) => { setEditing(m); setShowForm(true); };
  // ImageDropzone will handle upload and previous deletion

  const saveMember = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name || !editing.role) { toast({ title:'Missing fields', description:'Name and role required', variant:'destructive'}); return; }
    try {
      const base:any = { name:editing.name, role:editing.role, email:editing.email, phone:editing.phone, imageUrl:editing.imageUrl, imagePath:editing.imagePath || '', order: editing.order ?? 0, linkedin: editing.linkedin || '' };
      if (editing.id) { await updateWithTimestamp('board_members', editing.id, base); }
      else { await createWithTimestamps('board_members', base); }
      toast({ title:'Saved', description: editing.role });
      reset(); fetchMembers();
    } catch (err:any) { toast({ title:'Save failed', description: err.message || 'Error', variant:'destructive'}); }
  };

  const handleDelete = async (m:BoardMember) => {
    if (!m.id) { setMembers(list=>list.filter(x=>x!==m)); return; }
    await confirmDelete('Delete this member?', async ()=>{ await deleteDoc(doc(db,'board_members', m.id!)); fetchMembers(); });
  };

  // When adding a new member, pick the next highest order index to avoid duplicates
  const addOptional = () => {
    const nextOrder = members.reduce((max, x) => Math.max(max, x.order ?? 0), -1) + 1;
    setEditing({ name:'', role:'member', email:'', phone:'', imageUrl:'', order: nextOrder, linkedin:'' });
    setShowForm(true);
  };

  return <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5"/>Manage Board</h3>
        <p className="text-sm text-muted-foreground">Add and edit board members</p>
      </div>
      <Button size="sm" className="flex items-center gap-2" onClick={addOptional}><Plus className="h-4 w-4"/>Add Member</Button>
    </div>

    {showForm && editing && <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">{editing.id? 'Edit':'Add'} Board Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={saveMember} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editing.name} onChange={e=>setEditing(m=> m? { ...m, name:e.target.value }: m)} required />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={editing.role} onChange={e=>setEditing(m=> m? { ...m, role:e.target.value }: m)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editing.email} onChange={e=>setEditing(m=> m? { ...m, email:e.target.value }: m)} />
            </div>
            <div className="space-y-2">
              <Label>Phone / Contact</Label>
              <Input value={editing.phone} onChange={e=>setEditing(m=> m? { ...m, phone:e.target.value }: m)} />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input value={editing.linkedin || ''} onChange={e=>setEditing(m=> m? { ...m, linkedin:e.target.value }: m)} />
            </div>
            {/* New field to control display ordering */}
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={editing.order ?? 0} onChange={e=>setEditing(m=> m? { ...m, order: Number(e.target.value) }: m)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Photo</Label>
              <ImageDropzone existingUrl={editing.imageUrl || null} previousPath={editing.imagePath || null} pathPrefix={`board_members/${editing.role || 'member'}-`} onUploaded={({url, path})=> setEditing(m=> m? { ...m, imageUrl:url, imagePath:path }: m)} description="Drag & drop or click to select." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="gap-1"><Save className="h-4 w-4"/>{editing.id? 'Update':'Save'}</Button>
            <Button type="button" size="sm" variant="outline" onClick={reset}>Cancel</Button>
            {editing.imageUrl && <Button type="button" size="sm" variant="ghost" onClick={()=> setEditing(m=> m? { ...m, imageUrl:'', imagePath:'' }: m)}>Remove Photo</Button>}
          </div>
        </form>
      </CardContent>
    </Card>}

    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Board Members</CardTitle>
        <CardDescription>{members.length} total</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-8 w-full"/> )}</div>
        ) : members.length===0 ? (
          <p className="text-xs text-muted-foreground">No members yet.</p>
        ) : (
          <div className="space-y-3">
            {members.map(m=>
              <div key={m.id} className="p-3 border rounded-md bg-muted/40 flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  {m.imageUrl ? <img src={m.imageUrl} className="h-12 w-12 rounded-full object-cover border" alt={m.name || m.role} /> : <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">IMG</div>}
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name || <span className="text-muted-foreground">(no name)</span>}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{m.role.replace('_',' ')}</p>
                    {(m.email || m.phone) && <p className="text-[10px] text-muted-foreground truncate">{m.email} {m.phone && ' • '+m.phone}</p>}
                    {m.linkedin && <p className="text-[10px] text-muted-foreground truncate"><a href={m.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></p>}
                    {/* Show current order for clarity */}
                    <p className="text-[10px] text-muted-foreground">Order: {m.order ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>startEdit(m)}><Edit className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={()=>handleDelete(m)}><Trash2 className="h-4 w-4"/></Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  </div>;
}
