"use client";

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

function AdminClubManager() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setName(''); setDescription(''); setEditingId(null);
    fetchClubs();
  };

  const handleEdit = (club: any) => {
    setEditingId(club.id);
    setName(club.name);
    setDescription(club.description);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'clubs', id));
    fetchClubs();
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Manage Clubs</h2>
      <form onSubmit={handleAddOrUpdate} className="flex gap-2 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Club Name" className="border p-1" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-1" required />
        <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
        {editingId && <Button type="button" onClick={() => { setEditingId(null); setName(''); setDescription(''); }}>Cancel</Button>}
      </form>
      {loading ? <div>Loading...</div> : (
        <ul>
          {clubs.map(club => (
            <li key={club.id} className="mb-2 flex items-center gap-2">
              <span className="font-semibold">{club.name}</span> - {club.description}
              <Button size="sm" onClick={() => handleEdit(club)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(club.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClubRepManager({ clubId }: { clubId: string }) {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
  };

  if (loading) return <div>Loading...</div>;
  if (!club) return <div>No club found.</div>;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Edit Your Club</h2>
      <form onSubmit={handleUpdate} className="flex gap-2 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Club Name" className="border p-1" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-1" required />
        <Button type="submit">Update</Button>
      </form>
      <div>
        <span className="font-semibold">{club.name}</span> - {club.description}
      </div>
    </div>
  );
}

function AdminNewsManager() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [clubId, setClubId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setTitle(''); setContent(''); setClubId(''); setEditingId(null);
    fetchNews();
  };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setClubId(item.clubId || '');
  };
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'news', id));
    fetchNews();
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Manage News</h2>
      <form onSubmit={handleAddOrUpdate} className="flex gap-2 mb-4 flex-wrap">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="border p-1" required />
        <input value={content} onChange={e => setContent(e.target.value)} placeholder="Content" className="border p-1" required />
        <input value={clubId} onChange={e => setClubId(e.target.value)} placeholder="Club ID (optional)" className="border p-1" />
        <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
        {editingId && <Button type="button" onClick={() => { setEditingId(null); setTitle(''); setContent(''); setClubId(''); }}>Cancel</Button>}
      </form>
      {loading ? <div>Loading...</div> : (
        <ul>
          {news.map(item => (
            <li key={item.id} className="mb-2 flex items-center gap-2">
              <span className="font-semibold">{item.title}</span> - {item.content} {item.clubId && <span className="text-xs">(Club: {item.clubId})</span>}
              <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClubRepNewsManager({ clubId }: { clubId: string }) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setTitle(''); setContent(''); setEditingId(null);
    fetchNews();
  };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
  };
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'news', id));
    fetchNews();
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Manage Your Club's News</h2>
      <form onSubmit={handleAddOrUpdate} className="flex gap-2 mb-4 flex-wrap">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="border p-1" required />
        <input value={content} onChange={e => setContent(e.target.value)} placeholder="Content" className="border p-1" required />
        <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
        {editingId && <Button type="button" onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}>Cancel</Button>}
      </form>
      {loading ? <div>Loading...</div> : (
        <ul>
          {news.map(item => (
            <li key={item.id} className="mb-2 flex items-center gap-2">
              <span className="font-semibold">{item.title}</span> - {item.content}
              <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminCoursesManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setTitle(''); setDescription(''); setEditingId(null);
    fetchCourses();
  };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
  };
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'courses', id));
    fetchCourses();
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Manage Courses</h2>
      <form onSubmit={handleAddOrUpdate} className="flex gap-2 mb-4 flex-wrap">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="border p-1" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-1" required />
        <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
        {editingId && <Button type="button" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }}>Cancel</Button>}
      </form>
      {loading ? <div>Loading...</div> : (
        <ul>
          {courses.map(item => (
            <li key={item.id} className="mb-2 flex items-center gap-2">
              <span className="font-semibold">{item.title}</span> - {item.description}
              <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClubRepCoursesManager({ clubId }: { clubId: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setTitle(''); setDescription(''); setEditingId(null);
    fetchCourses();
  };
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
  };
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'courses', id));
    fetchCourses();
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Manage Your Club's Courses</h2>
      <form onSubmit={handleAddOrUpdate} className="flex gap-2 mb-4 flex-wrap">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="border p-1" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-1" required />
        <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
        {editingId && <Button type="button" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }}>Cancel</Button>}
      </form>
      {loading ? <div>Loading...</div> : (
        <ul>
          {courses.map(item => (
            <li key={item.id} className="mb-2 flex items-center gap-2">
              <span className="font-semibold">{item.title}</span> - {item.description}
              <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardCMS() {
  const { userData } = useAuth();
  if (!userData) return null;
  if (userData.role === 'admin') {
    return (
      <>
        <AdminClubManager />
        <AdminNewsManager />
        <AdminCoursesManager />
      </>
    );
  }
  if (userData.role === 'club_rep' && userData.clubId) {
    return (
      <>
        <ClubRepManager clubId={userData.clubId} />
        <ClubRepNewsManager clubId={userData.clubId} />
        <ClubRepCoursesManager clubId={userData.clubId} />
      </>
    );
  }
  return <div className="p-8">No access.</div>;
}
