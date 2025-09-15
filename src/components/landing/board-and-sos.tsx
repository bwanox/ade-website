"use client";

import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Linkedin, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

type FirestoreBoardMember = { id: string; name: string; role: string; email?: string; phone?: string; imageUrl?: string; order?: number; linkedin?: string };

const formatRole = (r: string) => r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const MemberCard = ({ member }: { member: FirestoreBoardMember }) => {
  return (
    <div className="group w-full [perspective:1000px]">
      <div className="relative h-24 w-full rounded-lg transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <div className="h-full w-full rounded-lg bg-secondary flex items-center p-4">
            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
              {member.imageUrl && <AvatarImage src={member.imageUrl} alt={member.name} />}
              <AvatarFallback>{(member.name || '?').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 min-w-0">
              <h4 className="font-semibold truncate">{member.name || '(Pending)'}</h4>
              <p className="text-sm text-muted-foreground truncate">{formatRole(member.role)}</p>
            </div>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-lg bg-primary [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex h-full w-full items-center justify-evenly text-primary-foreground">
            {member.phone && (
              <a href={`tel:${member.phone}`} className="inline-flex">
                <Button variant="ghost" size="icon" className="hover:bg-white/20" aria-label="Call">
                  <Phone className="h-5 w-5" />
                </Button>
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className="inline-flex">
                <Button variant="ghost" size="icon" className="hover:bg-white/20" aria-label="Email">
                  <Mail className="h-5 w-5" />
                </Button>
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex">
                <Button variant="ghost" size="icon" className="hover:bg-white/20" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function BoardAndSos() {
  const [members, setMembers] = useState<FirestoreBoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'board_members'));
        const list: FirestoreBoardMember[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setMembers(list.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Board Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-xs text-muted-foreground">Loading board...</p>}
          {!loading && members.length === 0 && <p className="text-xs text-muted-foreground">No board members yet.</p>}
          {!loading && members.map(m => (
            <MemberCard key={m.id} member={m} />
          ))}
          <Button asChild variant="outline" className="w-full">
            <Link href="/board">Show all</Link>
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-accent/20 border-accent">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Quick Help</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            <Link href="/sos">
              <ShieldAlert className="mr-2 h-5 w-5" /> Emergency SOS
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
