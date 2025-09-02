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
  MoreHorizontal
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function AdminClubManager() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchClubs = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'clubs'));
    setClubs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchClubs(); }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, 'clubs', editingId), { name, description });
    } else {
      await addDoc(collection(db, 'clubs'), { name, description });
    }
    setName(''); setDescription(''); setEditingId(null); setShowForm(false);
    fetchClubs();
  };

  const handleEdit = (club: any) => {
    setEditingId(club.id);
    setName(club.name);
    setDescription(club.description);
    setShowForm(true);
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
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="club-description">Description</Label>
                  <Textarea
                    id="club-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter club description"
                    required
                    rows={3}
                  />
                </div>
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

export function ClubRepManager({ clubId }: { clubId: string }) {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchClub = async () => {
      const q = query(collection(db, 'clubs'), where('__name__', '==', clubId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data();
        setClub({ id: clubId, ...docData });
        setName(docData.name);
        setDescription(docData.description);
      }
      setLoading(false);
    };
    fetchClub();
  }, [clubId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDoc(doc(db, 'clubs', clubId), { name, description });
    setClub({ ...club, name, description });
    setIsEditing(false);
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
                <div className="space-y-2">
                  <Label htmlFor="club-description">Description</Label>
                  <Textarea
                    id="club-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter club description"
                    required
                    rows={3}
                  />
                </div>
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

export function AdminNewsManager() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [clubId, setClubId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'news'));
    setNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };
  useEffect(() => { fetchNews(); }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, 'news', editingId), { title, content, clubId });
    } else {
      await addDoc(collection(db, 'news'), { title, content, clubId });
    }
    setTitle(''); setContent(''); setClubId(''); setEditingId(null); setShowForm(false);
    fetchNews();
  };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setClubId(item.clubId || '');
    setShowForm(true);
  };
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this news item?')) {
    await deleteDoc(doc(db, 'news', id));
    fetchNews();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setClubId('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            Manage News
          </h2>
          <p className="text-muted-foreground">Create and manage news articles</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add News
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Edit News' : 'Add New News'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update news article' : 'Create a new news article'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="news-title">Title</Label>
                <Input
                  id="news-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter news title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-content">Content</Label>
                <Textarea
                  id="news-content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Enter news content"
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-club">Club ID (Optional)</Label>
                <Input
                  id="news-club"
                  value={clubId}
                  onChange={e => setClubId(e.target.value)}
                  placeholder="Enter club ID if club-specific"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update News' : 'Create News'}
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
          <CardTitle>All News</CardTitle>
          <CardDescription>
            {news.length} {news.length === 1 ? 'article' : 'articles'} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No news yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first news article.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create News
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {item.content}
                        </p>
                        {item.clubId && (
                          <Badge variant="outline" className="text-xs">
                            Club: {item.clubId}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
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

export function ClubRepNewsManager({ clubId }: { clubId: string }) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    const q = query(collection(db, 'news'), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    setNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };
  useEffect(() => { fetchNews(); }, [clubId]);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, 'news', editingId), { title, content, clubId });
    } else {
      await addDoc(collection(db, 'news'), { title, content, clubId });
    }
    setTitle(''); setContent(''); setEditingId(null); setShowForm(false);
    fetchNews();
  };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setShowForm(true);
  };
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this news item?')) {
    await deleteDoc(doc(db, 'news', id));
    fetchNews();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            Club News
          </h2>
          <p className="text-muted-foreground">Manage news for your club</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add News
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Edit News' : 'Add New News'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update news article' : 'Create a new news article for your club'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="club-news-title">Title</Label>
                <Input
                  id="club-news-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter news title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-news-content">Content</Label>
                <Textarea
                  id="club-news-content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Enter news content"
                  required
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update News' : 'Create News'}
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
          <CardTitle>Club News</CardTitle>
          <CardDescription>
            {news.length} {news.length === 1 ? 'article' : 'articles'} for your club
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No news yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first news article.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create News
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {item.content}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Club: {clubId}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
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

export function AdminCoursesManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'courses'));
    setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };
  useEffect(() => { fetchCourses(); }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, 'courses', editingId), { title, description });
    } else {
      await addDoc(collection(db, 'courses'), { title, description });
    }
    setTitle(''); setDescription(''); setEditingId(null); setShowForm(false);
    fetchCourses();
  };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setShowForm(true);
  };
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
    await deleteDoc(doc(db, 'courses', id));
    fetchCourses();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Manage Courses
          </h2>
          <p className="text-muted-foreground">Create and manage course offerings</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Edit Course' : 'Add New Course'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update course information' : 'Create a new course offering'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-title">Course Title</Label>
                  <Input
                    id="course-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-description">Description</Label>
                  <Textarea
                    id="course-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter course description"
                    required
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update Course' : 'Create Course'}
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
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first course.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(course)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(course.id)}
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

export function ClubRepCoursesManager({ clubId }: { clubId: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const q = query(collection(db, 'courses'), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };
  useEffect(() => { fetchCourses(); }, [clubId]);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, 'courses', editingId), { title, description, clubId });
    } else {
      await addDoc(collection(db, 'courses'), { title, description, clubId });
    }
    setTitle(''); setDescription(''); setEditingId(null); setShowForm(false);
    fetchCourses();
  };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setShowForm(true);
  };
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteDoc(doc(db, 'courses', id));
      fetchCourses();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Club Courses
          </h2>
          <p className="text-muted-foreground">Manage courses for your club</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Edit Course' : 'Add New Course'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update course information' : 'Create a new course for your club'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="club-course-title">Course Title</Label>
                  <Input
                    id="club-course-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club-course-description">Description</Label>
                  <Textarea
                    id="club-course-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter course description"
                    required
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update Course' : 'Create Course'}
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
          <CardTitle>Club Courses</CardTitle>
          <CardDescription>
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} for your club
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first course.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Club: {clubId}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(course)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(course.id)}
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

export default function DashboardCMS() {
  const { userData } = useAuth();
  if (!userData) return null;
  
  // This component is now used within the main dashboard page
  // The section-based navigation is handled in the main dashboard component
  // This is kept for backward compatibility but the main dashboard handles the routing
  
  if (userData.role === 'admin') {
    return (
      <div className="space-y-8">
        <AdminClubManager />
        <AdminNewsManager />
        <AdminCoursesManager />
      </div>
    );
  }
  if (userData.role === 'club_rep' && userData.clubId) {
    return (
      <div className="space-y-8">
        <ClubRepManager clubId={userData.clubId} />
        <ClubRepNewsManager clubId={userData.clubId} />
        <ClubRepCoursesManager clubId={userData.clubId} />
      </div>
    );
  }
  return (
    <Card>
      <CardContent className="text-center py-8">
        <div className="text-muted-foreground">
          <p>No access to content management features.</p>
          <p className="text-sm mt-2">Contact an administrator for access.</p>
        </div>
      </CardContent>
    </Card>
  );
}
