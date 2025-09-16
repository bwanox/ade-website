"use client";
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageDropzone } from '@/components/upload/image-dropzone';
import { createWithTimestamps, updateWithTimestamp, confirmDelete } from '@/lib/cms/types';
import { slugify } from '@/types/firestore-content';

export interface HighlightDoc {
  id: string;
  title: string;
  image?: string | null;
  imagePath?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export function AdminHighlightsManager() {
  const [items, setItems] = useState<HighlightDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'highlights'));
    setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<HighlightDoc,'id'>) })) as HighlightDoc[]);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const reset = () => { setEditingId(null); setTitle(''); setImage(''); setImagePath(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const base: any = { title, image, imagePath };
    if (editingId) await updateWithTimestamp('highlights', editingId, base);
    else await createWithTimestamps('highlights', base);
    reset(); setShowForm(false); fetchItems();
  };

  const handleEdit = (h: HighlightDoc) => {
    setEditingId(h.id);
    setTitle(h.title || '');
    setImage(h.image || '');
    setImagePath(h.imagePath || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await confirmDelete('Delete highlight?', async () => {
      await deleteDoc(doc(db, 'highlights', id));
      fetchItems();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold flex items-center gap-2"><Star className="h-5 w-5"/>Manage Highlights</h3>
          <p className="text-sm text-muted-foreground">Upload featured images with titles</p>
        </div>
        <Button onClick={() => { reset(); setShowForm(true); }} size="sm" className="flex items-center gap-2"><Plus className="h-4 w-4"/>New</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">{editingId ? 'Edit Highlight' : 'Create Highlight'}</CardTitle>
            <CardDescription>High-quality JPG/PNG/WebP recommended</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Hackathon Winners" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Image</Label>
                  <ImageDropzone
                    existingUrl={image}
                    previousPath={imagePath}
                    pathPrefix={`highlights/${editingId || slugify(title) || 'highlight'}-`}
                    onUploaded={({ url, path }) => { setImage(url); setImagePath(path); }}
                  />
                  {image && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setImage(''); setImagePath(''); }}>
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="gap-1"><Save className="h-4 w-4"/>{editingId? 'Update':'Save'}</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">All Highlights</CardTitle>
          <CardDescription>{items.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_,i) => <Skeleton key={i} className="h-8 w-full"/> )}</div>
          ) : items.length === 0 ? (
            <p className="text-xs text-muted-foreground">No highlights yet.</p>
          ) : (
            <div className="space-y-4">
              {items.map((h) => (
                <div key={h.id} className="p-3 border rounded-md flex items-center gap-3 bg-muted/40">
                  <div className="h-16 w-24 bg-background border rounded overflow-hidden flex items-center justify-center">
                    {h.image ? <img src={h.image} alt={h.title} className="h-full w-full object-cover"/> : <span className="text-[10px] text-muted-foreground">No image</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{h.title}</div>
                  </div>
                  <div className="flex gap-1 items-start">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(h)}><Edit className="h-4 w-4"/></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(h.id)}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
