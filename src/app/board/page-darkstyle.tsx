"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Linkedin } from "lucide-react";

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

  const featuredFirst = useMemo(() => {
    // Light grouping: presidents/leads first, then others.
    const priority = (r?: string) => {
      const s = (r || "").toLowerCase();
      if (/president|chair|lead/.test(s)) return 0;
      if (/vice|co-?lead|manager/.test(s)) return 1;
      return 2;
    };
    return [...members].sort((a, b) => priority(a.role) - priority(b.role));
  }, [members]);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a1020] text-neutral-100">
      {/* Blueprint background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,241,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:repeating-linear-gradient(0deg,rgba(148,163,184,0.25)_0px,rgba(148,163,184,0.25)_1px,transparent_1px,transparent_36px),repeating-linear-gradient(90deg,rgba(148,163,184,0.25)_0px,rgba(148,163,184,0.25)_1px,transparent_1px,transparent_36px)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_50%_50%,#16a6ff_0.5px,transparent_0.6px)] [background-size:26px_26px]" />
      </div>

      <div className="container mx-auto px-6 py-14 md:py-20">
        <header className="mb-10 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
            Student Association Board
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-white to-cyan-200 bg-clip-text text-transparent">Engineering Leadership</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300/90">
            The people designing, building, and operating our future. Meet the team behind initiatives, execution, and outcomes.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 text-[10px] uppercase tracking-wider text-slate-400">
            <span className="inline-flex items-center gap-2"><i className="h-1 w-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" /> Strategy</span>
            <span className="inline-flex items-center gap-2"><i className="h-1 w-6 bg-gradient-to-r from-transparent via-indigo-400 to-transparent" /> Delivery</span>
            <span className="inline-flex items-center gap-2"><i className="h-1 w-6 bg-gradient-to-r from-transparent via-sky-400 to-transparent" /> Impact</span>
          </div>
        </header>

        {error && <p className="text-sm text-rose-400 mb-6 text-center">{error}</p>}
        {loading && <BlueprintSkeleton />}
        {!loading && !error && featuredFirst.length === 0 && (
          <div className="text-center py-20 text-slate-400 text-sm">No members yet.</div>
        )}

        {!loading && !error && featuredFirst.length > 0 && (
          <section className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredFirst.map((m, i) => (
              <MemberCardTech key={m.id} member={m} index={i} />
            ))}
          </section>
        )}
      </div>

      {/* page keyframes */}
      <StyleOnce />
    </div>
  );
}

function MemberCardTech({ member, index }: { member: FirestoreBoardMember; index: number }) {
  return (
    <article
      className="relative group rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900/70 to-slate-900/30 p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
      style={{ animation: `cardIn 600ms cubic-bezier(.2,.8,.2,1) ${index * 70}ms both` }}
    >
      {/* Tech corners */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl">
        <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-cyan-400/40" />
        <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-cyan-400/40" />
        <span className="absolute left-3 bottom-3 h-4 w-4 border-l border-b border-cyan-400/40" />
        <span className="absolute right-3 bottom-3 h-4 w-4 border-r border-b border-cyan-400/40" />
      </div>

      {/* subtle moving grid */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute -inset-20 opacity-[0.06] [background-image:repeating-linear-gradient(0deg,#7dd3fc_0px,#7dd3fc_1px,transparent_1px,transparent_22px),repeating-linear-gradient(90deg,#7dd3fc_0px,#7dd3fc_1px,transparent_1px,transparent_22px)] animate-[drift_18s_linear_infinite]" />
      </div>

      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-cyan-400/20 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Avatar className="h-16 w-16 ring-2 ring-slate-700/70">
            {member.imageUrl ? (
              <AvatarImage src={member.imageUrl} alt={member.name} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-slate-800 text-cyan-200 font-black">
                {(member.name || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">{member.name || "(Pending)"}</span>
          </h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cyan-300/80">
            {member.role ? formatRole(member.role) : "Board Member"}
          </p>
        </div>
      </div>

      <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-600/60 to-transparent" />

      <div className="mt-4 grid grid-cols-3 gap-3">
        <ContactPill
          type="email"
          label="Email"
          href={member.email ? `mailto:${member.email}` : undefined}
          disabled={!member.email}
          title={member.email}
          delay={0}
        />
        <ContactPill
          type="phone"
          label="Call"
          href={member.phone ? `tel:${member.phone}` : undefined}
          disabled={!member.phone}
          title={member.phone}
          delay={1}
        />
        <ContactPill
          type="linkedin"
          label="LinkedIn"
          href={member.linkedin}
          disabled={!member.linkedin}
          title={member.linkedin}
          delay={2}
          external
        />
      </div>

      {(member.email || member.phone) && (
        <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/40 p-3">
          <ul className="space-y-1.5 text-xs text-slate-300">
            {member.email && (
              <li className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 text-cyan-300" /><span className="truncate">{member.email}</span></li>
            )}
            {member.phone && (
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-cyan-300" /><span>{member.phone}</span></li>
            )}
          </ul>
        </div>
      )}
    </article>
  );
}

function ContactPill({
  type,
  label,
  href,
  disabled,
  delay,
  external,
  title,
}: {
  type: "email" | "phone" | "linkedin";
  label: string;
  href?: string;
  disabled?: boolean;
  delay: number;
  external?: boolean;
  title?: string;
}) {
  const Icon = type === "email" ? Mail : type === "phone" ? Phone : Linkedin;
  const content = (
    <span
      className={`${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:-translate-y-[2px] hover:shadow-[0_8px_22px_-10px_rgba(56,189,248,0.45)]"
      } group flex items-center justify-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-900/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-200 transition-all duration-300`} 
      style={{ animation: `chipIn 500ms cubic-bezier(.2,.8,.2,1) ${delay * 120}ms both` }}
      title={title || label}
    >
      <Icon className={`h-3.5 w-3.5 ${disabled ? "text-slate-500" : "text-cyan-300 group-hover:text-cyan-200"}`} />
      <span>{label}</span>
    </span>
  );

  if (disabled || !href) return content;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:ring-offset-0 rounded-lg"
    >
      {content}
    </a>
  );
}

function BlueprintSkeleton() {
  return (
    <div className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="relative rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 overflow-hidden"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.06)_55%,transparent_70%)]" />
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-slate-800" />
              <div className="h-3 w-1/3 rounded bg-slate-800" />
            </div>
          </div>
          <div className="mt-5 h-px bg-slate-700/70" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="h-9 rounded-lg bg-slate-800" />
            <div className="h-9 rounded-lg bg-slate-800" />
            <div className="h-9 rounded-lg bg-slate-800" />
          </div>
          <div className="mt-4 h-16 rounded-xl bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function StyleOnce() {
  if (typeof window === "undefined") return null;
  if (document.getElementById("board-tech-styles")) return null;
  const style = document.createElement("style");
  style.id = "board-tech-styles";
  style.innerHTML = `
    @keyframes cardIn {
      0% { opacity: 0; transform: translateY(14px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes chipIn {
      0% { opacity: 0; transform: translateY(6px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes drift {
      0% { transform: translate3d(0,0,0); }
      50% { transform: translate3d(10px,8px,0); }
      100% { transform: translate3d(0,0,0); }
    }
  `;
  document.head.appendChild(style);
  return null;
}
