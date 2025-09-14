"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Newspaper } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { NewsArticleDoc } from '@/lib/cms/types';
import { confirmDelete, createWithTimestamps, updateWithTimestamp } from '@/lib/cms/types';
import { ImageDropzone } from '@/components/upload/image-dropzone';
import { slugify } from '@/types/firestore-content';

export function AdminNewsManager() {
  const [articles, setArticles] = useState<NewsArticleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'news'));
    setArticles(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<NewsArticleDoc,'id'>) })));
    setLoading(false);
  };
  useEffect(()=>{ fetchArticles(); },[]);

  const reset = () => { setEditingId(null); setHeadline(''); setSummary(''); setContent(''); setCategory(''); setImage(''); setImagePath(''); setPublished(false); setFeatured(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const base:any = { headline, summary, content, category, image, imagePath, published, featured };
    if (editingId) await updateWithTimestamp('news', editingId, base); else await createWithTimestamps('news', base);
    reset(); setShowForm(false); fetchArticles();
  };
  const handleEdit = (a:NewsArticleDoc) => { setEditingId(a.id); setHeadline(a.headline||''); setSummary(a.summary||''); setContent(a.content||''); setCategory(a.category||''); setImage(a.image||''); setImagePath((a as any).imagePath || ''); setPublished(!!a.published); setFeatured(!!a.featured); setShowForm(true); };
  const handleDelete = async (id:string) => { await confirmDelete('Delete article?', async ()=>{ await deleteDoc(doc(db,'news',id)); fetchArticles(); }); };

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
            <div className="space-y-2 md:col-span-2">
              <Label>Image</Label>
              <div className="space-y-2">
                <ImageDropzone
                  existingUrl={image}
                  previousPath={imagePath}
                  pathPrefix={`news/${editingId || slugify(headline) || 'article'}-`}
                  onUploaded={({ url, path }) => { setImage(url); setImagePath(path); }}
                />
                {image && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setImage(''); setImagePath(''); }}>
                    Remove Image
                  </Button>
                )}
              </div>
            </div>
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
