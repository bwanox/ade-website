"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Linkedin } from 'lucide-react';

// Expanded type with contact fields
type FirestoreBoardMember = { id: string; name: string; role: string; imageUrl?: string; order?: number; email?: string; phone?: string; linkedin?: string };

const formatRole = (r: string) => r?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function BoardPage() {
  const [members, setMembers] = useState<FirestoreBoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'board_members'));
        if (!active) return;
        const list: FirestoreBoardMember[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setMembers(list);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed loading board');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_60%,#f5f9ff_100%)] text-neutral-900">
      {/* Enhanced soft ambient background with subtle animated lights + navy accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* navy radial accents */}
        <div className="absolute inset-0 mix-blend-multiply opacity-40 bg-[radial-gradient(circle_at_15%_20%,#0a2540_0%,transparent_55%),radial-gradient(circle_at_85%_75%,#132f52_0%,transparent_60%)]" />
        {/* base gradient (light) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(0,0,0,0.05),transparent_60%),radial-gradient(circle_at_80%_65%,rgba(0,0,0,0.05),transparent_65%),linear-gradient(120deg,#ffffff_0%,#fafafa_70%,#ffffff_100%)]" />
        {/* large grid */}
        <div className="absolute inset-0 opacity-50 [background-image:repeating-linear-gradient(0deg,rgba(10,37,64,0.06)_0px,rgba(10,37,64,0.06)_1px,transparent_1px,transparent_90px),repeating-linear-gradient(90deg,rgba(10,37,64,0.06)_0px,rgba(10,37,64,0.06)_1px,transparent_1px,transparent_90px)] mix-blend-multiply" />
        {/* fine grid */}
        <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,rgba(10,37,64,0.08)_0px,rgba(10,37,64,0.08)_1px,transparent_1px,transparent_18px),repeating-linear-gradient(90deg,rgba(10,37,64,0.08)_0px,rgba(10,37,64,0.08)_1px,transparent_1px,transparent_18px)]" />
        {/* moving light sweeps */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[40%] bg-[conic-gradient(from_0deg,transparent_0deg,#ffffff_35deg,#ffffff_90deg,transparent_140deg)] opacity-25 animate-[spin_28s_linear_infinite]" />
          <div className="absolute -inset-[45%] bg-[conic-gradient(from_180deg,transparent_0deg,#dce8f5_20deg,#ffffff_70deg,transparent_120deg)] opacity-20 animate-[spin_40s_linear_reverse_infinite]" />
          <div className="absolute -inset-[48%] bg-[conic-gradient(from_90deg,transparent_0deg,#134b9a_25deg,#0a2540_60deg,transparent_140deg)] opacity-10 animate-[spin_55s_linear_infinite]" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <header className="mb-14 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900/5 border border-neutral-900/10 backdrop-blur-sm px-5 py-2 text-[11px] tracking-[0.25em] font-semibold uppercase text-neutral-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-neutral-900/60 animate-pulse" />
            Board Directory
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-headline font-bold leading-tight tracking-tight bg-gradient-to-r from-[#0a2540] via-[#132f52] to-[#0a2540]/60 bg-clip-text text-transparent">
            Vision. Stewardship. Execution.
          </h1>
          <p className="mt-6 max-w-2xl text-sm md:text-base text-neutral-600 leading-relaxed">
            Meet the board guiding strategic direction, accountability and innovation.
          </p>
        </header>

        {error && <p className="text-sm text-red-600 mb-8">{error}</p>}
        {loading && <LightSkeleton />}
        {!loading && !error && members.length === 0 && (
          <div className="text-center py-20 text-neutral-500 text-sm">No members yet.</div>
        )}
        {!loading && !error && members.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced member card with stronger image & title emphasis and separated role badge
function MemberCard({ member, index }: { member: FirestoreBoardMember; index: number }) {
  return (
    <div
      className="group relative rounded-3xl p-[1px] transition-all duration-500"
      style={{ animation: `fadeIn 0.8s ease ${(index * 60)}ms both` }}
    >
      {/* Animated gradient ring with navy tones */}
      <div className="absolute inset-0 rounded-[inherit] bg-[conic-gradient(from_140deg,#0a2540_0deg,rgba(10,37,64,0.15)_80deg,rgba(10,37,64,0.05)_140deg,#132f52_210deg,rgba(10,37,64,0.15)_270deg,#0a2540_330deg)] opacity-70 group-hover:opacity-90 transition-opacity" />
      <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(140deg,rgba(255,255,255,0.85),rgba(255,255,255,0.55))] mix-blend-overlay opacity-0 group-hover:opacity-40 transition-opacity" />
      {/* Card body */}
      <div className="relative h-full w-full overflow-hidden rounded-[inherit] bg-white/80 backdrop-blur-xl px-8 pt-12 pb-10 shadow-[0_4px_16px_-4px_rgba(10,37,64,0.15),0_8px_32px_-8px_rgba(10,37,64,0.1)] group-hover:shadow-[0_10px_28px_-6px_rgba(10,37,64,0.28),0_22px_60px_-10px_rgba(10,37,64,0.25)] transition-shadow">
        <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#0a2540] via-[#134b9a] to-transparent opacity-80 group-hover:opacity-100" />
        {/* Halo */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_50%_55%,#134b9a22,transparent_65%)] pointer-events-none" />
        <div className="flex flex-col items-center text-center relative">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0a2540] via-[#134b9a] to-[#0a2540] blur-[26px] opacity-25 group-hover:opacity-45 transition-opacity" />
            <div className="relative p-[4px] rounded-full bg-gradient-to-br from-[#0a2540] via-[#134b9a] to-[#0a2540] shadow-[0_10px_32px_-10px_rgba(10,37,64,0.55)] group-hover:shadow-[0_14px_40px_-10px_rgba(10,37,64,0.6)] transition-shadow">
              <Avatar className="h-36 w-36 ring-4 ring-white shadow-lg shadow-[#0a2540]/20 transition-transform duration-700 group-hover:scale-[1.045]">
                {member.imageUrl && <AvatarImage src={member.imageUrl} alt={member.name} />}
                <AvatarFallback className="bg-[#e6eef7] text-[#0a2540] text-4xl font-semibold">
                  {(member.name || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Animated subtle aura */}
              <div className="absolute inset-0 rounded-full ring-2 ring-[#ffffff80] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-[#0a2540] via-[#134b9a] to-[#0a2540]/70 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-[5px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-[#134b9a] after:via-[#0a2540] after:to-transparent after:opacity-30 group-hover:after:opacity-70 after:transition-opacity">
              {member.name || '(Pending)'}
            </span>
            {member.linkedin && (
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_#ffffffa0] animate-pulse" aria-hidden="true" />
            )}
          </h3>
          <div className="mt-5">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#134b9a0d] border border-[#134b9a20] backdrop-blur-sm text-[#0a2540] text-sm md:text-base font-semibold tracking-wide shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#134b9a] animate-pulse" />
              {member.role ? formatRole(member.role) : '—'}
            </span>
          </div>
          {/* Divider */}
          <div className="mt-8 mb-8 h-px w-32 bg-gradient-to-r from-transparent via-[#134b9a40] to-transparent" />
          {/* Contact actions (large) */}
          <div className="flex items-start justify-center gap-8 max-w-full w-full">
            <ContactIcon large type="email" href={member.email ? `mailto:${member.email}` : undefined} label="Email" delay={0} showLabel />
            <ContactIcon large type="phone" href={member.phone ? `tel:${member.phone}` : undefined} label="Call" delay={1} showLabel />
            <ContactIcon large type="linkedin" href={member.linkedin} label="LinkedIn" delay={2} external showLabel />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactIcon({ href, label, type, delay, external, showLabel, large }: { href?: string; label: string; type: 'email' | 'phone' | 'linkedin'; delay: number; external?: boolean; showLabel?: boolean; large?: boolean }) {
  const disabled = !href;
  const Icon = type === 'email' ? Mail : type === 'phone' ? Phone : Linkedin;
  const style = { animation: `iconIn 0.7s cubic-bezier(.4,.8,.4,1) ${(delay * 120)}ms both` } as any;

  if (large) {
    const base = `group/icon relative flex flex-col items-center justify-center rounded-2xl border backdrop-blur-sm transition-all ${disabled ? 'opacity-30 cursor-not-allowed border-[#0a2540]/15' : 'hover:shadow-[0_8px_28px_-6px_rgba(10,37,64,0.3)] hover:-translate-y-1 border-[#0a2540]/15 hover:border-[#134b9a]/50'} bg-white/70 w-24 h-24`;
    const circle = `flex h-14 w-14 items-center justify-center rounded-xl border ${disabled ? 'border-[#0a2540]/15 bg-white/40' : 'border-[#0a2540]/15 bg-white/80 group-hover/icon:border-[#134b9a] group-hover/icon:bg-white'} transition-colors shadow-sm`;
    const content = (
      <span className={base} aria-label={label} style={style}>
        <span className={circle}>
          <Icon className="h-6 w-6 text-[#0a2540]" />
        </span>
        {showLabel && <span className="mt-3 text-[11px] font-semibold tracking-wide uppercase text-[#0a2540]">{label}</span>}
      </span>
    );
    if (disabled) return content;
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{content}</a>
    );
  }

  // ...existing code (original compact variant kept for potential reuse)...
  const baseWrapper = `group/icon relative flex items-center gap-2 pl-2 pr-3 h-11 rounded-2xl border backdrop-blur-sm transition-all text-xs font-semibold tracking-wide uppercase ${disabled ? 'opacity-30 cursor-not-allowed border-[#0a2540]/15 text-[#0a2540]/40' : 'border-[#0a2540]/20 text-[#0a2540] hover:border-[#134b9a] hover:bg-[#134b9a0d] hover:shadow-[0_4px_18px_-4px_rgba(10,37,64,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#134b9a]/40'} bg-white/70`;
  const circle = `flex h-7 w-7 items-center justify-center rounded-xl border ${disabled ? 'border-[#0a2540]/15 bg-white/40' : 'border-[#0a2540]/20 bg-white/60 group-hover/icon:border-[#134b9a] group-hover/icon:bg-white'} transition-colors`;
  const content = (
    <span className={baseWrapper} aria-label={label} style={style}>
      <span className={circle}><Icon className="h-3.5 w-3.5" /></span>
      {showLabel && <span className="pt-[1px]">{label}</span>}
    </span>
  );
  if (disabled) return content;
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{content}</a>
  );
}

// Shimmer skeleton
function LightSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="relative rounded-3xl p-[1px] bg-gradient-to-br from-neutral-200/70 via-neutral-100/40 to-neutral-50">
          <div className="rounded-[inherit] bg-white/70 backdrop-blur-xl p-7 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.6)_45%,rgba(255,255,255,0.9)_50%,rgba(255,255,255,0.6)_55%,transparent_70%)]" />
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 rounded-full bg-neutral-200" />
              <div className="flex-1 space-y-3 mt-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
            </div>
            <div className="mt-7 flex gap-3">
              <div className="h-11 w-11 rounded-2xl bg-neutral-200" />
              <div className="h-11 w-11 rounded-2xl bg-neutral-200" />
              <div className="h-11 w-11 rounded-2xl bg-neutral-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Keyframes (scoped via global style injection) - ensures animations without editing global css
if (typeof window !== 'undefined' && !document.getElementById('board-anim-styles')) {
  const style = document.createElement('style');
  style.id = 'board-anim-styles';
  style.innerHTML = `@keyframes fadeIn{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}@keyframes iconIn{0%{opacity:0;transform:translateY(8px) scale(.9)}60%{opacity:1;transform:translateY(-2px) scale(1.03)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes shimmer{100%{transform:translateX(100%)}}`;
  document.head.appendChild(style);
}
