"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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
        const q = query(collection(db, 'board_members'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        if (!active) return;
        const list: FirestoreBoardMember[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        // Local safeguard sort in case some items have missing or inconsistent 'order'
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
        <header className="mb-20 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#134b9a]/8 to-[#0a2540]/8 border border-[#134b9a]/20 backdrop-blur-sm px-6 py-3 text-xs tracking-[0.2em] font-bold uppercase text-[#0a2540] shadow-lg mb-8">
            <div className="relative">
              <span className="h-2 w-2 rounded-full bg-[#134b9a] animate-pulse shadow-lg" />
              <span className="absolute inset-0 h-2 w-2 rounded-full bg-[#134b9a] animate-ping" />
            </div>
            Board of Directors
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-6">
            <span className="bg-gradient-to-r from-[#0a2540] via-[#134b9a] via-[#1e5aa8] to-[#0a2540] bg-clip-text text-transparent">
              Leadership
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#134b9a] via-[#1e5aa8] to-[#134b9a] bg-clip-text text-transparent">
              Excellence
            </span>
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed font-medium mb-6">
              Meet the visionary leaders driving strategic innovation, ensuring accountability, and steering our organization toward a future of excellence and growth.
            </p>
            
            {/* Stats or highlights */}
            <div className="flex items-center justify-center gap-8 text-sm text-neutral-500 font-semibold">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#134b9a]" />
                <span>Strategic Vision</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#1e5aa8]" />
                <span>Proven Leadership</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#0a2540]" />
                <span>Innovation Focus</span>
              </div>
            </div>
          </div>
          
          {/* Decorative line */}
          <div className="mt-12 flex items-center justify-center">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#134b9a]/40 to-transparent" />
            <div className="mx-4 h-2 w-2 rounded-full bg-[#134b9a]/30" />
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#134b9a]/40 to-transparent" />
          </div>
        </header>

        {error && <p className="text-sm text-red-600 mb-8">{error}</p>}
        {loading && <LightSkeleton />}
        {!loading && !error && members.length === 0 && (
          <div className="text-center py-20 text-neutral-500 text-sm">No members yet.</div>
        )}
        {!loading && !error && members.length > 0 && (
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-fr">
            {members.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced member card with premium glass morphism and sophisticated animations
function MemberCard({ member, index }: { member: FirestoreBoardMember; index: number }) {
  return (
    <div
      className="group relative rounded-3xl p-[1.5px] transition-all duration-700 hover:scale-[1.02] transform-gpu"
      style={{ animation: `fadeIn 0.8s ease ${(index * 80)}ms both` }}
    >
      {/* Multi-layer gradient border with enhanced animation */}
      <div className="absolute inset-0 rounded-[inherit] bg-[conic-gradient(from_140deg,#0a2540_0deg,rgba(10,37,64,0.2)_80deg,rgba(19,75,154,0.15)_140deg,#132f52_210deg,rgba(10,37,64,0.2)_270deg,#0a2540_330deg)] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 rounded-[inherit] bg-[conic-gradient(from_-40deg,transparent_0deg,rgba(255,255,255,0.3)_60deg,transparent_120deg)] opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
      
      {/* Premium glass card body */}
      <div className="relative h-full w-full overflow-hidden rounded-[inherit] bg-white/85 backdrop-blur-2xl px-8 pt-14 pb-12 shadow-[0_8px_32px_-8px_rgba(10,37,64,0.2),0_20px_64px_-16px_rgba(10,37,64,0.15)] group-hover:shadow-[0_16px_48px_-8px_rgba(10,37,64,0.35),0_32px_96px_-16px_rgba(10,37,64,0.25)] transition-all duration-700">
        
        {/* Premium top accent */}
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#0a2540] via-[#134b9a] via-[#1e5aa8] to-[#0a2540] opacity-90 group-hover:opacity-100 group-hover:h-[5px] transition-all duration-500" />
        
        {/* Ambient background glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_50%_60%,rgba(19,75,154,0.08),transparent_70%)] pointer-events-none group-hover:bg-[radial-gradient(circle_at_50%_60%,rgba(19,75,154,0.15),transparent_70%)] transition-all duration-700" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          
          {/* Enhanced avatar section */}
          <div className="relative mb-10">
            {/* Multi-layer glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0a2540] via-[#134b9a] to-[#1e5aa8] blur-[32px] opacity-20 group-hover:opacity-40 group-hover:blur-[40px] transition-all duration-700" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#134b9a] to-[#0a2540] blur-[16px] opacity-15 group-hover:opacity-25 transition-all duration-500" />
            
            {/* Avatar container with enhanced styling */}
            <div className="relative p-[5px] rounded-full bg-gradient-to-br from-[#0a2540] via-[#134b9a] via-[#1e5aa8] to-[#0a2540] shadow-[0_12px_40px_-12px_rgba(10,37,64,0.6)] group-hover:shadow-[0_20px_56px_-12px_rgba(10,37,64,0.7)] transition-all duration-700">
              <Avatar className="h-40 w-40 ring-[6px] ring-white/90 shadow-2xl shadow-[#0a2540]/30 transition-all duration-700 group-hover:scale-[1.05] group-hover:ring-white">
                {member.imageUrl && <AvatarImage src={member.imageUrl} alt={member.name} className="object-cover" />}
                <AvatarFallback className="bg-gradient-to-br from-[#e6eef7] to-[#dce8f5] text-[#0a2540] text-5xl font-bold">
                  {(member.name || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full ring-2 ring-white/50 animate-[pulse_4s_ease-in-out_infinite] pointer-events-none" />
              <div className="absolute inset-0 rounded-full ring-1 ring-[#134b9a]/20 animate-[pulse_6s_ease-in-out_infinite_reverse] pointer-events-none" />
            </div>

            {/* Status indicator for active members */}
            {(member.email || member.phone || member.linkedin) && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30 ring-4 ring-white group-hover:scale-110 transition-transform duration-300">
                  <div className="h-2 w-2 rounded-full bg-white mx-auto mt-2 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Enhanced name section with sophisticated styling */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              {/* Background glow for the name */}
              <div className="absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-[#0a2540] via-[#134b9a] to-[#1e5aa8] bg-clip-text text-transparent">
                  {member.name || '(Pending)'}
                </h3>
              </div>
              
              {/* Main name with sophisticated gradient and effects */}
              <h3 className="relative text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-[1.1] transition-all duration-500">
                <span className="relative inline-block">
                  {/* Text shadow layer for depth */}
                  <span className="absolute inset-0 bg-gradient-to-br from-[#0a2540] via-[#134b9a] to-[#2d5aa0] bg-clip-text text-transparent opacity-60 blur-[0.5px] transform translate-x-[1px] translate-y-[1px]">
                    {member.name || '(Pending)'}
                  </span>
                  
                  {/* Main text with rich gradient */}
                  <span className="relative bg-gradient-to-br from-[#0a2540] via-[#1a4d6b] via-[#134b9a] to-[#0f3a5f] bg-clip-text text-transparent group-hover:bg-gradient-to-br group-hover:from-[#134b9a] group-hover:via-[#1e5aa8] group-hover:to-[#0a2540] transition-all duration-700">
                    {member.name || '(Pending)'}
                  </span>
                  
                  {/* Animated underline with enhanced styling */}
                  <div className="absolute -bottom-3 left-0 w-full h-[2px] rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-[#134b9a]/20 via-[#1e5aa8]/40 to-[#0a2540]/20 opacity-40 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#134b9a] to-transparent h-[2px] w-0 group-hover:w-full transition-all duration-700 delay-200 rounded-full shadow-lg shadow-[#134b9a]/50" />
                  </div>
                  
                  {/* Subtle shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 w-0 group-hover:w-full transition-all duration-1000 opacity-0 group-hover:opacity-100 delay-300" />
                </span>
              </h3>
            </div>
            
            {/* Connection status badge with enhanced styling */}
            {member.linkedin && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-500/20 blur-lg rounded-full animate-pulse" />
                  <span className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100/80 border border-emerald-200/60 text-emerald-700 text-xs font-bold backdrop-blur-sm shadow-lg shadow-emerald-500/10 group-hover:shadow-emerald-500/20 transition-all duration-300">
                    <div className="relative">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
                      <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <span className="tracking-wide">Connected</span>
                  </span>
                </div>
              </div>
            )}
            
            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-1 mt-4 opacity-30 group-hover:opacity-60 transition-all duration-500">
              <div className="h-[1px] w-4 bg-gradient-to-r from-transparent to-[#134b9a]/40" />
              <div className="h-1 w-1 rounded-full bg-[#134b9a]/40" />
              <div className="h-[1px] w-8 bg-gradient-to-r from-[#134b9a]/40 via-[#1e5aa8]/40 to-[#134b9a]/40" />
              <div className="h-1 w-1 rounded-full bg-[#134b9a]/40" />
              <div className="h-[1px] w-4 bg-gradient-to-r from-[#134b9a]/40 to-transparent" />
            </div>
          </div>

          {/* Enhanced role section with premium styling */}
          <div className="mb-8">
            <div className="relative group/role">
              {/* Role badge glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#134b9a]/10 to-[#0a2540]/10 blur-xl rounded-2xl opacity-0 group-hover/role:opacity-60 transition-all duration-700" />
              
              <span className="relative inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-br from-white/90 via-white/80 to-white/70 border border-[#134b9a]/25 backdrop-blur-lg shadow-xl shadow-[#0a2540]/10 group-hover/role:shadow-2xl group-hover/role:shadow-[#134b9a]/20 group-hover/role:border-[#134b9a]/40 transition-all duration-500 transform group-hover/role:scale-105">
                
                {/* Inner gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#134b9a]/5 via-transparent to-[#0a2540]/5 opacity-0 group-hover/role:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex items-center gap-3">
                  {/* Enhanced role indicator */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#134b9a] to-[#1e5aa8] rounded-full blur-sm opacity-60 animate-pulse" />
                    <span className="relative h-3 w-3 rounded-full bg-gradient-to-r from-[#134b9a] to-[#1e5aa8] shadow-lg animate-pulse ring-2 ring-white/50" />
                  </div>
                  
                  {/* Role text with enhanced styling */}
                  <span className="text-base md:text-lg font-black tracking-wide bg-gradient-to-r from-[#0a2540] via-[#134b9a] to-[#0a2540] bg-clip-text text-transparent group-hover/role:from-[#134b9a] group-hover/role:to-[#0a2540] transition-all duration-500">
                    {member.role ? formatRole(member.role) : 'Board Member'}
                  </span>
                </div>
                
                {/* Animated border highlight */}
                <div className="absolute inset-0 rounded-2xl border border-[#134b9a]/0 group-hover/role:border-[#134b9a]/30 transition-all duration-500" />
              </span>
              
              {/* Enhanced role accent line */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-[3px] w-20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-transparent via-[#134b9a]/30 to-transparent opacity-50 group-hover/role:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#134b9a] via-[#1e5aa8] to-[#134b9a] h-[3px] w-0 group-hover/role:w-full transition-all duration-700 delay-200 rounded-full shadow-lg shadow-[#134b9a]/50" />
              </div>
            </div>
          </div>

          {/* Elegant divider */}
          <div className="relative mb-10 w-full flex items-center justify-center">
            <div className="h-px w-40 bg-gradient-to-r from-transparent via-[#134b9a]/40 to-transparent" />
            <div className="absolute h-2 w-2 rounded-full bg-[#134b9a]/30 shadow-lg" />
          </div>

          {/* Enhanced contact section */}
          <div className="w-full">
            <div className="flex items-center justify-center gap-4 mb-6">
              <ContactIcon 
                enhanced 
                type="email" 
                href={member.email ? `mailto:${member.email}` : undefined} 
                label="Email" 
                delay={0} 
                showLabel 
                contactValue={member.email}
              />
              <ContactIcon 
                enhanced 
                type="phone" 
                href={member.phone ? `tel:${member.phone}` : undefined} 
                label="Call" 
                delay={1} 
                showLabel 
                contactValue={member.phone}
              />
              <ContactIcon 
                enhanced 
                type="linkedin" 
                href={member.linkedin} 
                label="LinkedIn" 
                delay={2} 
                external 
                showLabel 
                contactValue={member.linkedin}
              />
            </div>
            
            {/* Contact info preview */}
            {(member.email || member.phone) && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#134b9a]/5 to-[#0a2540]/5 border border-[#134b9a]/10 backdrop-blur-sm">
                <div className="space-y-2 text-sm text-[#0a2540]/80">
                  {member.email && (
                    <div className="flex items-center justify-center gap-2 truncate">
                      <Mail className="h-3 w-3 text-[#134b9a]" />
                      <span className="font-medium truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-3 w-3 text-[#134b9a]" />
                      <span className="font-medium">{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactIcon({ 
  href, 
  label, 
  type, 
  delay, 
  external, 
  showLabel, 
  large, 
  enhanced, 
  contactValue 
}: { 
  href?: string; 
  label: string; 
  type: 'email' | 'phone' | 'linkedin'; 
  delay: number; 
  external?: boolean; 
  showLabel?: boolean; 
  large?: boolean;
  enhanced?: boolean;
  contactValue?: string;
}) {
  const disabled = !href;
  const Icon = type === 'email' ? Mail : type === 'phone' ? Phone : Linkedin;
  const style = { animation: `iconIn 0.7s cubic-bezier(.4,.8,.4,1) ${(delay * 120)}ms both` } as any;

  // Enhanced premium styling
  if (enhanced) {
    const base = `group/icon relative flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm transition-all duration-500 ${
      disabled 
        ? 'opacity-40 cursor-not-allowed bg-white/30 border border-[#0a2540]/10' 
        : 'bg-white/80 border border-[#134b9a]/20 hover:border-[#134b9a]/50 hover:bg-white/95 hover:shadow-[0_12px_32px_-8px_rgba(10,37,64,0.35)] hover:-translate-y-2 hover:scale-105 active:scale-95'
    } w-20 h-20`;
    
    const iconContainer = `relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 ${
      disabled 
        ? 'bg-white/60 border border-[#0a2540]/10' 
        : 'bg-gradient-to-br from-white to-[#f8fafc] border border-[#134b9a]/20 group-hover/icon:border-[#134b9a] group-hover/icon:bg-gradient-to-br group-hover/icon:from-[#134b9a]/5 group-hover/icon:to-white group-hover/icon:shadow-lg'
    }`;
    
    const content = (
      <div className={base} aria-label={label} style={style} title={contactValue || label}>
        {/* Background glow effect */}
        {!disabled && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#134b9a]/5 to-[#0a2540]/5 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500 -z-10" />
        )}
        
        <div className={iconContainer}>
          {/* Icon glow */}
          {!disabled && (
            <div className="absolute inset-0 rounded-xl bg-[#134b9a]/10 blur-sm opacity-0 group-hover/icon:opacity-60 transition-all duration-500" />
          )}
          <Icon className={`relative z-10 transition-all duration-300 ${
            disabled 
              ? 'h-5 w-5 text-[#0a2540]/40' 
              : 'h-5 w-5 text-[#0a2540] group-hover/icon:text-[#134b9a] group-hover/icon:scale-110'
          }`} />
          
          {/* Active indicator */}
          {!disabled && (
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-80 shadow-sm shadow-emerald-500/30 animate-pulse" />
          )}
        </div>
        
        {showLabel && (
          <span className={`mt-2 text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${
            disabled 
              ? 'text-[#0a2540]/40' 
              : 'text-[#0a2540] group-hover/icon:text-[#134b9a]'
          }`}>
            {label}
          </span>
        )}
      </div>
    );
    
    if (disabled) return content;
    return (
      <a 
        href={href} 
        className="focus:outline-none focus:ring-2 focus:ring-[#134b9a]/40 focus:ring-offset-2 rounded-2xl"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }

  // Large variant (existing)
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

  // Compact variant (existing)
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

// Enhanced skeleton with better proportions matching the new design
function LightSkeleton() {
  return (
    <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-[#0a2540]/20 via-neutral-200/50 to-neutral-100/40">
          <div className="rounded-[inherit] bg-white/80 backdrop-blur-xl px-8 pt-14 pb-12 overflow-hidden relative min-h-[520px]">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.6)_45%,rgba(255,255,255,0.9)_50%,rgba(255,255,255,0.6)_55%,transparent_70%)]" />
            
            {/* Top accent */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Avatar skeleton */}
              <div className="relative">
                <div className="h-40 w-40 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 ring-6 ring-white shadow-lg" />
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-neutral-300" />
              </div>
              
              {/* Name skeleton */}
              <div className="space-y-2">
                <div className="h-8 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg w-48" />
                <div className="h-4 bg-neutral-200 rounded w-24 mx-auto" />
              </div>
              
              {/* Role skeleton */}
              <div className="h-12 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-2xl w-40" />
              
              {/* Divider */}
              <div className="h-px w-40 bg-neutral-200" />
              
              {/* Contact icons skeleton */}
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300" />
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300" />
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300" />
              </div>
              
              {/* Contact info skeleton */}
              <div className="w-full p-4 rounded-xl bg-neutral-100 space-y-2">
                <div className="h-3 bg-neutral-200 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-neutral-200 rounded w-1/2 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Enhanced keyframes with smooth professional animations
if (typeof window !== 'undefined' && !document.getElementById('board-anim-styles')) {
  const style = document.createElement('style');
  style.id = 'board-anim-styles';
  style.innerHTML = `
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(20px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes iconIn {
      0% { opacity: 0; transform: translateY(12px) scale(0.8); }
      60% { opacity: 1; transform: translateY(-4px) scale(1.05); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(19, 75, 154, 0.2); }
      50% { box-shadow: 0 0 30px rgba(19, 75, 154, 0.4); }
    }
  `;
  document.head.appendChild(style);
}
