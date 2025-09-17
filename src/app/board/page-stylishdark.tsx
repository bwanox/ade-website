"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Linkedin, ExternalLink, Zap, Settings } from "lucide-react";

// Firestore type
type FirestoreBoardMember = {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  order?: number;
  email?: string;
  phone?: string;
  linkedin?: string;
};

const formatRole = (r: string) => r?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function BoardPage() {
  const [members, setMembers] = useState<FirestoreBoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const q = query(collection(db, "board_members"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        if (!active) return;
        const list: FirestoreBoardMember[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setMembers(list);
      } catch (e: any) {
        if (active) setError(e?.message || "Failed loading board");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const { executives, board } = useMemo(() => {
    const execs = members.filter((m) => /president|chair|lead/i.test(m.role || ""));
    const boardMembers = members.filter((m) => !/president|chair|lead/i.test(m.role || ""));
    return { executives: execs, board: boardMembers };
  }, [members]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Engineering Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(34,197,94,0.15),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      {/* Animated Circuit Lines */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q200,50 400,100 T800,100 L800,200 Q600,150 400,200 T0,200 Z"
            fill="none"
            stroke="url(#circuitGradient)"
            strokeWidth="2"
            className="animate-pulse"
          />
          <path
            d="M0,300 Q300,250 600,300 T1200,300"
            fill="none"
            stroke="url(#circuitGradient)"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 backdrop-blur-sm">
              <div className="relative">
                <Settings className="w-5 h-5 text-green-400 animate-spin" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-0 w-5 h-5 rounded-full bg-green-400/20 animate-ping" />
              </div>
              <span className="text-sm font-semibold text-green-400 tracking-wider uppercase">Engineering Leadership</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Board of Directors
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-lg text-slate-300 leading-relaxed">
              Meet the innovative minds architecting the future of engineering education. 
              Our leadership team combines technical expertise with visionary thinking.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { icon: Zap, label: "Innovation", color: "text-yellow-400" },
                { icon: Settings, label: "Engineering", color: "text-green-400" },
                { icon: ExternalLink, label: "Leadership", color: "text-blue-400" }
              ].map(({ icon: Icon, label, color }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm font-medium text-slate-200">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 pb-16">
          {error && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">
                <ExternalLink className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {loading && <EngineeringLoader />}

          {!loading && !error && members.length === 0 && (
            <div className="text-center py-20">
              <div className="text-slate-400 text-lg">No board members found.</div>
            </div>
          )}

          {!loading && !error && members.length > 0 && (
            <div className="space-y-16">
              {executives.length > 0 && (
                <ExecutiveSection members={executives} />
              )}
              {board.length > 0 && (
                <BoardSection members={board} />
              )}
            </div>
          )}
        </div>
      </div>

      <EngineeringStyles />
    </div>
  );
}

// Executive leadership card with premium styling
function ExecutiveCard({ member, index }: { member: FirestoreBoardMember; index: number }) {
  return (
    <div
      className="relative group"
      style={{ animation: `slideIn 800ms cubic-bezier(0.23, 1, 0.32, 1) ${index * 150}ms both` }}
    >
      {/* Holographic border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/30 via-blue-500/30 to-purple-500/30 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="h-full w-full rounded-2xl bg-slate-800" />
      </div>

      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-green-400/50" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-400/50" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-400/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-green-400/50" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start gap-6">
            <div className="relative">
              {/* Avatar glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/30 to-blue-400/30 blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Avatar className="relative h-20 w-20 ring-2 ring-gradient-to-r ring-green-400/50">
                {member.imageUrl ? (
                  <AvatarImage src={member.imageUrl} alt={member.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-bold text-xl">
                    {(member.name || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-slate-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 animate-pulse" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                {member.name || "TBA"}
              </h3>
              <p className="text-sm font-semibold text-slate-300 mt-1 uppercase tracking-wider">
                {member.role ? formatRole(member.role) : "Executive"}
              </p>
              
              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <ContactButton
                  type="email"
                  href={member.email ? `mailto:${member.email}` : undefined}
                  disabled={!member.email}
                  tooltip={member.email}
                />
                <ContactButton
                  type="phone"
                  href={member.phone ? `tel:${member.phone}` : undefined}
                  disabled={!member.phone}
                  tooltip={member.phone}
                />
                <ContactButton
                  type="linkedin"
                  href={member.linkedin}
                  disabled={!member.linkedin}
                  tooltip={member.linkedin}
                  external
                />
              </div>
            </div>
          </div>

          {/* Tech specs */}
          {(member.email || member.phone) && (
            <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Contact Protocol</span>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                {member.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <code className="text-xs bg-slate-800 px-2 py-1 rounded font-mono">{member.email}</code>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-green-400" />
                    <code className="text-xs bg-slate-800 px-2 py-1 rounded font-mono">{member.phone}</code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Executive section with premium layout
function ExecutiveSection({ members }: { members: FirestoreBoardMember[] }) {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
          <Zap className="w-5 h-5 text-green-400" />
          <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">Executive Team</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Leadership Council
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          The strategic minds driving innovation and excellence in engineering education.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {members.map((member, index) => (
          <ExecutiveCard key={member.id} member={member} index={index} />
        ))}
      </div>
    </section>
  );
}

// Board members section with modern tech layout
function BoardSection({ members }: { members: FirestoreBoardMember[] }) {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
          <Settings className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Board Members</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Engineering Council
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Dedicated individuals contributing their expertise to advance our engineering community.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member, index) => (
          <BoardMemberCard key={member.id} member={member} index={index} />
        ))}
      </div>
    </section>
  );
}

function BoardMemberCard({ member, index }: { member: FirestoreBoardMember; index: number }) {
  return (
    <div
      className="relative group"
      style={{ animation: `fadeInUp 600ms cubic-bezier(0.23, 1, 0.32, 1) ${index * 100}ms both` }}
    >
      <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
        {/* Circuit corners */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-blue-400/50 group-hover:border-blue-400 transition-colors" />
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-purple-400/50 group-hover:border-purple-400 transition-colors" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-green-400/50 group-hover:border-green-400 transition-colors" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-blue-400/50 group-hover:border-blue-400 transition-colors" />

        <div className="space-y-4">
          {/* Avatar and basic info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-blue-400/30 group-hover:ring-blue-400/70 transition-all">
                {member.imageUrl ? (
                  <AvatarImage src={member.imageUrl} alt={member.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                    {(member.name || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                {member.name || "TBA"}
              </h3>
              <p className="text-sm text-slate-400 uppercase tracking-wider truncate">
                {member.role ? formatRole(member.role) : "Member"}
              </p>
            </div>
          </div>

          {/* Contact actions */}
          <div className="flex gap-2">
            <ContactButton
              type="email"
              href={member.email ? `mailto:${member.email}` : undefined}
              disabled={!member.email}
              tooltip={member.email}
              compact
            />
            <ContactButton
              type="phone"
              href={member.phone ? `tel:${member.phone}` : undefined}
              disabled={!member.phone}
              tooltip={member.phone}
              compact
            />
            <ContactButton
              type="linkedin"
              href={member.linkedin}
              disabled={!member.linkedin}
              tooltip={member.linkedin}
              external
              compact
            />
          </div>

          {/* Connection status */}
          <div className="pt-3 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactButton({
  type,
  href,
  disabled,
  external,
  tooltip,
  compact = false,
}: {
  type: "email" | "phone" | "linkedin";
  href?: string;
  disabled?: boolean;
  external?: boolean;
  tooltip?: string;
  compact?: boolean;
}) {
  const Icon = type === "email" ? Mail : type === "phone" ? Phone : Linkedin;
  const colors = {
    email: "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10",
    phone: "text-green-400 hover:text-green-300 hover:bg-green-400/10",
    linkedin: "text-purple-400 hover:text-purple-300 hover:bg-purple-400/10",
  };

  const baseClasses = compact
    ? "p-2 rounded-lg border border-slate-600/50 transition-all duration-300 flex-1 flex items-center justify-center"
    : "p-3 rounded-lg border border-slate-600/50 transition-all duration-300 hover:-translate-y-1";

  const content = (
    <button
      className={`${baseClasses} ${
        disabled
          ? "opacity-40 cursor-not-allowed border-slate-700/50 text-slate-500"
          : `${colors[type]} hover:border-${type === 'email' ? 'blue' : type === 'phone' ? 'green' : 'purple'}-400/50 hover:shadow-lg hover:shadow-${type === 'email' ? 'blue' : type === 'phone' ? 'green' : 'purple'}-400/20`
      }`}
      disabled={disabled}
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
      {!compact && <span className="sr-only">{type}</span>}
    </button>
  );

  if (disabled || !href) return content;

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-lg"
    >
      {content}
    </a>
  );
}

function EngineeringLoader() {
  return (
    <div className="space-y-16">
      {/* Executive skeleton */}
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-block w-48 h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-700/50 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="w-32 h-6 bg-slate-700/50 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-slate-700/50 rounded animate-pulse" />
                  <div className="flex gap-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="w-10 h-10 bg-slate-700/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Board members skeleton */}
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-block w-40 h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-700/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-20 h-4 bg-slate-700/50 rounded animate-pulse" />
                  <div className="w-16 h-3 bg-slate-700/50 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex-1 h-10 bg-slate-700/50 rounded-lg animate-pulse" />
                ))}
              </div>
              <div className="pt-3 border-t border-slate-700/50">
                <div className="w-full h-4 bg-slate-700/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EngineeringStyles() {
  if (typeof window === "undefined") return null;
  if (document.getElementById("engineering-board-styles")) return null;
  const style = document.createElement("style");
  style.id = "engineering-board-styles";
  style.innerHTML = `
    @keyframes slideIn {
      0% { 
        opacity: 0; 
        transform: translateY(30px) scale(0.95);
      }
      100% { 
        opacity: 1; 
        transform: translateY(0) scale(1);
      }
    }
    @keyframes fadeInUp {
      0% { 
        opacity: 0; 
        transform: translateY(20px);
      }
      100% { 
        opacity: 1; 
        transform: translateY(0);
      }
    }
    @keyframes glow {
      0%, 100% { 
        box-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
      }
      50% { 
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
      }
    }
    .animate-glow {
      animation: glow 2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
  return null;
}
