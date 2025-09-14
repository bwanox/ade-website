"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Edit, Trash2, Save, BookOpen, X } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePdfUpload } from '@/lib/cms/pdfUpload';
import type { CourseSemester, CourseModule, CourseResource, CourseDoc } from '@/lib/cms/types';
import { ensureUniqueSlug, confirmDelete, createWithTimestamps, updateWithTimestamp } from '@/lib/cms/types';
import { courseSchema, validateOrThrow } from '@/lib/cms/validation';
import { ImageDropzone } from '@/components/upload/image-dropzone';

export function AdminCoursesManager() {
  const [courseDocs, setCourseDocs] = useState<CourseDoc[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [title, setTitle] = useState(''); 
  const [slug, setSlug] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [difficulty, setDifficulty] = useState(''); 
  const [duration, setDuration] = useState(''); 
  const [year, setYear] = useState<number | ''>(''); 
  const [heroImage, setHeroImage] = useState(''); 
  const [heroImagePath, setHeroImagePath] = useState('');
  const [showForm, setShowForm] = useState(false); 
  const { toast } = useToast();
  const [semesters, setSemesters] = useState<CourseSemester[]>([]);
  const [resourceProgress, setResourceProgress] = useState<Record<string, number>>({});

  const { upload: uploadPdf } = usePdfUpload();
  const pdfOk = (file:File) => true; // validation handled inside hook
  const formatSize = (bytes:number) => bytes < 1024*1024 ? `${(bytes/1024).toFixed(1)}KB` : `${(bytes/1024/1024).toFixed(1)}MB`;
  const ensureSlugForUpload = () => { if (!slug) { toast({ title:'Set slug first', description:'Enter a slug before uploading files', variant:'destructive'}); return false; } return true; };

  const defaultSemesters = ():CourseSemester[] => ([{ id:'s1', title:'Semester 1', modules:[] },{ id:'s2', title:'Semester 2', modules:[] }]);
  const genId = (p='m') => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const addSemester = () => setSemesters(s => [...s, { id: genId('s'), title:`Semester ${s.length+1}`, modules:[] }]);
  const updateSemester = (idx:number, patch:Partial<CourseSemester>) => setSemesters(s => s.map((sem,i)=> i===idx ? { ...sem, ...patch }: sem));
  const removeSemester = (idx:number) => setSemesters(s => s.filter((_,i)=>i!==idx));
  const addModule = (semIdx:number) => setSemesters(s => s.map((sem,i)=> i===semIdx ? { ...sem, modules:[...sem.modules, { id: genId('mod'), title:`Module ${sem.modules.length+1}`, summary:'', status:'in-progress', resources:{} as CourseModule['resources'] }] }: sem));
  const updateModule = (semIdx:number, modIdx:number, patch:Partial<CourseModule>) => setSemesters(s => s.map((sem,i)=> i===semIdx ? { ...sem, modules: sem.modules.map((m,j)=> j===modIdx ? { ...m, ...patch }: m) } : sem));
  const removeModule = (semIdx:number, modIdx:number) => setSemesters(s => s.map((sem,i)=> i===semIdx ? { ...sem, modules: sem.modules.filter((_,j)=>j!==modIdx) } : sem));
  const setModuleResources = (semIdx:number, modIdx:number, updater:(r:CourseModule['resources'])=>CourseModule['resources']) => { setSemesters(s => s.map((sem,i)=> i===semIdx ? { ...sem, modules: sem.modules.map((m,j)=> j===modIdx ? { ...m, resources: updater(m.resources)}: m) }: sem)); };

  // Helper to add a resource via external link (URL)
  const addLinkResource = (semIdx:number, modIdx:number, kind:'lesson'|'exercise'|'exam') => {
    const url = typeof window !== 'undefined' ? window.prompt('Enter link URL (https://...)') : '';
    if (!url) return;
    try { new URL(url); } catch { toast({ title:'Invalid URL', description:'Please enter a valid URL starting with http(s)://', variant:'destructive'}); return; }
    const deriveTitle = (u:string) => {
      try { const { pathname, host } = new URL(u); const base = pathname.split('/').filter(Boolean).pop() || host; return decodeURIComponent(base || 'Resource'); } catch { return 'Resource'; }
    };
    const title = typeof window !== 'undefined' ? (window.prompt('Enter title', deriveTitle(url)) || deriveTitle(url)) : deriveTitle(url);
    const res:CourseResource = { title, type:'pdf', url };
    setModuleResources(semIdx, modIdx, (r)=>{
      if (kind==='lesson') return { ...r, lesson: res };
      if (kind==='exercise') return { ...r, exercises: [...(r.exercises||[]), res] };
      return { ...r, pastExams: [...(r.pastExams||[]), res] };
    });
    toast({ title:'Link added', description:title });
  };

  const handlePdfUpload = async (semIdx:number, modIdx:number, kind:'lesson'|'exercise'|'exam', file:File) => {
    if (!ensureSlugForUpload() || !pdfOk(file)) return; 
    const progressKey = `${semIdx}-${modIdx}-${kind}-${Date.now()}`;
    setResourceProgress(p=>({...p,[progressKey]:0}));
    try {
      const basePath = `course_resources/${slug}/${semesters[semIdx].id}/${semesters[semIdx].modules[modIdx].id}/${kind}-`;
      const uploaded = await uploadPdf(file, basePath, { onProgress: pct=> setResourceProgress(p=>({...p,[progressKey]:pct})) });
      if (!uploaded) return; const { url, path, title: upTitle } = uploaded;
      const res:CourseResource = { title: upTitle, type:'pdf', url, size: formatSize(file.size), path };
      setModuleResources(semIdx, modIdx, (r)=>{ if (kind==='lesson') return { ...r, lesson: res }; if (kind==='exercise') return { ...r, exercises: [...(r.exercises||[]), res] }; return { ...r, pastExams: [...(r.pastExams||[]), res] }; });
      toast({ title:'Uploaded', description:`${res.title}` });
    } catch (e:any) { toast({ title:'Upload failed', description:e.message || 'Error uploading PDF', variant:'destructive'}); }
    finally { setResourceProgress(p=>{ const c={...p}; delete c[progressKey]; return c; }); }
  };

  const fetchCourses = async () => { setLoading(true); const snap = await getDocs(collection(db,'courses')); setCourseDocs(snap.docs.map(d=>({ id:d.id, ...(d.data() as Omit<CourseDoc,'id'>)}))); setLoading(false); }; 
  useEffect(()=>{ fetchCourses(); },[]); 

  const reset = () => { setEditingId(null); setTitle(''); setSlug(''); setDescription(''); setDifficulty(''); setDuration(''); setYear(''); setHeroImage(''); setHeroImagePath(''); setSemesters([]); setResourceProgress({}); }; 

  const handleSubmit = async (e:React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      if (!editingId || (editingId && courseDocs.find(c=>c.id===editingId)?.slug !== slug)) { 
        if (!slug) { 
          toast({ title:'Slug required', description:'Provide a unique slug', variant:'destructive'}); 
          return; 
        } 
        const ok = await ensureUniqueSlug('courses', slug, editingId || undefined); 
        if (!ok) { 
          toast({ title:'Duplicate slug', description:'Another course already uses this slug', variant:'destructive'}); 
          return; 
        } 
      } 
      const base:any = { 
        title, 
        slug, 
        description, 
        difficulty, 
        duration, 
        year: year === ''? undefined: year, 
        heroImage: heroImage || undefined, 
        heroImageStoragePath: heroImagePath || undefined, 
        semesters 
      }; 
      try { 
        validateOrThrow(courseSchema, base, 'course'); 
      } catch(vErr:any){ 
        toast({ title:'Validation failed', description:vErr.message, variant:'destructive'}); 
        return; 
      } 
      if (editingId) { 
        await updateWithTimestamp('courses', editingId, base); 
        toast({ title:'Course updated', description:title }); 
      } else { 
        await createWithTimestamps('courses', base); 
        toast({ title:'Course created', description:title }); 
      } 
      reset(); 
      setShowForm(false); 
      fetchCourses(); 
    } catch (err:any) { 
      toast({ title:'Error saving course', description: err.message || 'Unexpected error', variant:'destructive'}); 
    } 
  };

  const handleEdit = (c:CourseDoc) => { setEditingId(c.id); setTitle(c.title||''); setSlug(c.slug||''); setDescription(c.description||''); setDifficulty(c.difficulty||''); setDuration(c.duration||''); setYear((c as any).year||''); setHeroImage((c as any).heroImage||''); setHeroImagePath((c as any).heroImageStoragePath||''); setSemesters((c as any).semesters||defaultSemesters()); setShowForm(true); }; 
  const handleDelete = async (id:string) => { await confirmDelete('Delete course?', async ()=>{ await deleteDoc(doc(db,'courses', id)); fetchCourses(); }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5"/>Manage Courses</h3>
          <p className="text-sm text-muted-foreground">Academic or training courses</p>
        </div>
        <Button size="sm" className="flex items-center gap-2" onClick={()=>{ reset(); setShowForm(true); }}><Plus className="h-4 w-4"/>New</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{editingId?'Edit':'Create'} Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e=>setTitle(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={e=>setSlug(e.target.value)} required /></div>
                <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} /></div>
                <div className="space-y-2"><Label>Difficulty</Label><Input value={difficulty} onChange={e=>setDifficulty(e.target.value)} placeholder="Beginner" /></div>
                <div className="space-y-2"><Label>Duration</Label><Input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="8 weeks" /></div>
                <div className="space-y-2"><Label>Year</Label><Input type="number" value={year} onChange={e=>setYear(e.target.value===''?'': Number(e.target.value))} /></div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Hero Image</Label>
                  <ImageDropzone
                    disabled={!slug}
                    existingUrl={heroImage || null}
                    previousPath={heroImagePath || null}
                    pathPrefix={`course_hero/${slug}-`}
                    label=""
                    description="Recommended 16:9. Drag & drop or click to replace."
                    onUploaded={({ url, path }) => { setHeroImage(url); setHeroImagePath(path); }}
                  />
                  {heroImage && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button type="button" size="sm" variant="outline" onClick={()=>{ setHeroImage(''); setHeroImagePath(''); }}>Remove</Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Curriculum (Semesters & Modules)</Label>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={()=>{ if(semesters.length===0) setSemesters(defaultSemesters()); else addSemester(); }}>Add Semester</Button>
                    <Button type="button" size="sm" variant="outline" onClick={()=>{ if(semesters.length===0) setSemesters(defaultSemesters()); }}>Init 2</Button>
                  </div>
                </div>
                {semesters.length===0 && <p className="text-xs text-muted-foreground">No semesters yet. Click Init 2 to create default semesters.</p>}
                <div className="space-y-6">
                  {semesters.map((sem, semIdx)=>(
                    <div key={sem.id} className="border rounded-md p-4 space-y-4 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Input value={sem.title} onChange={e=>updateSemester(semIdx,{ title:e.target.value })} className="font-medium" />
                        <Button type="button" size="sm" variant="secondary" onClick={()=>addModule(semIdx)} className="ml-auto">Add Module</Button>
                        <Button type="button" size="icon" variant="ghost" onClick={()=>removeSemester(semIdx)} className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button>
                      </div>
                      {sem.modules.length===0 && <p className="text-[10px] text-muted-foreground">No modules yet.</p>}
                      <div className="grid md:grid-cols-2 gap-4">
                        {sem.modules.map((mod, modIdx)=>(
                          <div key={mod.id} className="border rounded p-3 space-y-3 bg-background/60">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 space-y-2">
                                <Input value={mod.title} onChange={e=>updateModule(semIdx,modIdx,{ title:e.target.value })} placeholder="Module title" />
                                <Textarea rows={2} value={mod.summary} onChange={e=>updateModule(semIdx,modIdx,{ summary:e.target.value })} placeholder="Summary" />
                                <Input value={mod.status||''} onChange={e=>updateModule(semIdx,modIdx,{ status: e.target.value as any })} placeholder="Status (locked/in-progress/validated)" />
                              </div>
                              <Button type="button" size="icon" variant="ghost" onClick={()=>removeModule(semIdx,modIdx)} className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4"/></Button>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[11px] font-medium">Lesson</Label>
                              {mod.resources.lesson ? (
                                <div className="flex items-center justify-between gap-2 p-2 rounded bg-muted/40 text-xs">
                                  <span className="truncate flex-1">{mod.resources.lesson.title}</span>
                                  <div className="flex items-center gap-1">
                                    <Button asChild size="sm" variant="ghost" className="h-6 px-2 text-[10px]"><a href={mod.resources.lesson.url} target="_blank" rel="noopener noreferrer">View</a></Button>
                                    <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={()=> setModuleResources(semIdx,modIdx, r=>({...r, lesson:null}))}>Remove</Button>
                                    <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={()=> addLinkResource(semIdx, modIdx, 'lesson')}>Replace via Link</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-[10px]">
                                  <Input type="file" accept="application/pdf" onChange={e=>{ const f=e.target.files?.[0]; if(f) handlePdfUpload(semIdx,modIdx,'lesson',f); }} />
                                  <Button type="button" size="sm" variant="secondary" className="h-7 px-2" onClick={()=> addLinkResource(semIdx, modIdx, 'lesson')}>Add Link</Button>
                                  {Object.keys(resourceProgress).some(k=>k.startsWith(`${semIdx}-${modIdx}-lesson`)) && <span className="text-muted-foreground">Uploading…</span>}
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-medium">Exercises ({mod.resources.exercises?.length||0})</Label>
                                <div className="flex items-center gap-2">
                                  <Button type="button" size="sm" variant="secondary" className="h-6 px-2 text-[10px]" onClick={()=>{ const input=document.createElement('input'); input.type='file'; input.accept='application/pdf'; input.onchange=()=>{ const f=input.files?.[0]; if(f) handlePdfUpload(semIdx,modIdx,'exercise',f); }; input.click(); }}>Add</Button>
                                  <Button type="button" size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={()=> addLinkResource(semIdx, modIdx, 'exercise')}>Add Link</Button>
                                  {Object.keys(resourceProgress).some(k=>k.startsWith(`${semIdx}-${modIdx}-exercise`)) && <span className="text-muted-foreground text-[10px]">Uploading…</span>}
                                </div>
                              </div>
                              <div className="space-y-1">
                                {mod.resources.exercises?.map((r, idx)=>(
                                  <div key={idx} className="flex items-center gap-2 text-[10px] p-1 rounded bg-muted/40">
                                    <span className="truncate flex-1">{r.title}</span>
                                    <Button asChild size="sm" variant="ghost" className="h-6 px-1"><a href={r.url} target="_blank" rel="noopener noreferrer">Open</a></Button>
                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={()=> setModuleResources(semIdx,modIdx, rr=>({...rr, exercises: (rr.exercises||[]).filter((_,i)=>i!==idx) }))}><X className="h-3 w-3"/></Button>
                                  </div>
                                ))}
                                {(!mod.resources.exercises || mod.resources.exercises.length===0) && <p className="text-[10px] text-muted-foreground">None</p>}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-medium">Past Exams ({mod.resources.pastExams?.length||0})</Label>
                                <div className="flex items-center gap-2">
                                  <Button type="button" size="sm" variant="secondary" className="h-6 px-2 text-[10px]" onClick={()=>{ const input=document.createElement('input'); input.type='file'; input.accept='application/pdf'; input.onchange=()=>{ const f=input.files?.[0]; if(f) handlePdfUpload(semIdx,modIdx,'exam',f); }; input.click(); }}>Add</Button>
                                  <Button type="button" size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={()=> addLinkResource(semIdx, modIdx, 'exam')}>Add Link</Button>
                                  {Object.keys(resourceProgress).some(k=>k.startsWith(`${semIdx}-${modIdx}-exam`)) && <span className="text-muted-foreground text-[10px]">Uploading…</span>}
                                </div>
                              </div>
                              <div className="space-y-1">
                                {mod.resources.pastExams?.map((r, idx)=>(
                                  <div key={idx} className="flex items-center gap-2 text-[10px] p-1 rounded bg-muted/40">
                                    <span className="truncate flex-1">{r.title}</span>
                                    <Button asChild size="sm" variant="ghost" className="h-6 px-1"><a href={r.url} target="_blank" rel="noopener noreferrer">Open</a></Button>
                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={()=> setModuleResources(semIdx,modIdx, rr=>({...rr, pastExams: (rr.pastExams||[]).filter((_,i)=>i!==idx) }))}><X className="h-3 w-3"/></Button>
                                  </div>
                                ))}
                                {(!mod.resources.pastExams || mod.resources.pastExams.length===0) && <p className="text-[10px] text-muted-foreground">None</p>}
                              </div>
                            </div>
                            {Object.keys(resourceProgress).some(k=>k.startsWith(`${semIdx}-${modIdx}-`)) && (
                              <Progress
                                value={
                                  Object.entries(resourceProgress)
                                    .filter(([k])=>k.startsWith(`${semIdx}-${modIdx}-`))
                                    .reduce((acc,[,v])=> acc+v,0) /
                                  Object.entries(resourceProgress)
                                    .filter(([k])=>k.startsWith(`${semIdx}-${modIdx}-`)).length
                                }
                                className="h-2"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" className="gap-1"><Save className="h-4 w-4"/>{editingId?'Update':'Save'}</Button>
                <Button type="button" size="sm" variant="outline" onClick={()=>{ setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">All Courses</CardTitle>
          <CardDescription>{courseDocs.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-8 w-full"/> )}</div>
          ) : courseDocs.length===0 ? (
            <p className="text-xs text-muted-foreground">No courses yet.</p>
          ) : (
            <div className="space-y-4">
              {courseDocs.map(c=> (
                <div key={c.id} className="p-3 border rounded-md bg-muted/40 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm flex items-center gap-2">{c.title}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{c.description}</p>
                      <div className="flex gap-2 text-[10px] text-muted-foreground flex-wrap">
                        {c.difficulty && <span className="px-1.5 py-0.5 bg-background border rounded">{c.difficulty}</span>}
                        {c.duration && <span className="px-1.5 py-0.5 bg-background border rounded">{c.duration}</span>}
                        {c.year && <span className="px-1.5 py-0.5 bg-background border rounded">Year {c.year}</span>}
                        {c.semesters && <span className="px-1.5 py-0.5 bg-background border rounded">{c.semesters.length} semesters</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 items-start">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>handleEdit(c)}><Edit className="h-4 w-4"/></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={()=>handleDelete(c.id)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
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
