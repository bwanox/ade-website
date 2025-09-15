import { notFound } from 'next/navigation';
import { Users, Calendar, ArrowLeft, ExternalLink, Mail } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { clubSchema, ClubDoc } from '@/types/firestore-content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export const dynamic = 'force-dynamic'; // always fetch latest
// export const revalidate = 300; // (optional) switch to ISR if desired

interface Props { params: Promise<{ slug: string }> }

// Heuristic / mapping for icon selection
function pickIcon(data: Partial<ClubDoc>): any {
  const lcName = (data.name || '').toLowerCase();
  const lcCat = (data.category || '').toLowerCase();
  const lcSlug = (data.slug || '').toLowerCase();
  const iconName = (data as any).icon as string | undefined;
  if (iconName && (LucideIcons as any)[iconName]) return (LucideIcons as any)[iconName];
  if (lcCat.includes('robot') || lcSlug.includes('robot')) return (LucideIcons as any).Bot;
  if (lcCat.includes('electronic') || lcSlug.includes('electronic')) return (LucideIcons as any).Cpu;
  if (lcCat.includes('human') || lcCat.includes('impact') || lcCat.includes('social')) return (LucideIcons as any).HeartHandshake;
  if (lcCat.includes('ai') || lcCat.includes('ml') || lcSlug.includes('ai')) return (LucideIcons as any).Zap;
  if (lcCat.includes('design') || lcCat.includes('creative') || lcSlug.includes('design')) return (LucideIcons as any).Palette;
  if (lcCat.includes('hardware') || lcSlug.includes('hardware')) return (LucideIcons as any).Code;
  return Users;
}

async function fetchClub(slug: string): Promise<ClubDoc | null> {
  try {
    const baseCol = collection(db, 'clubs');
    // Fetch by slug only (no published filter)
    const q = query(baseCol, where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap || snap.empty) return null;
    const doc = snap.docs[0];
    const raw: any = { id: doc.id, ...doc.data() };
    const parsed = clubSchema.safeParse(raw);
    if (!parsed.success) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[ClubPage] Invalid club doc, using minimal fallback', slug, parsed.error.issues);
      }
      if (raw.name && raw.slug) {
        return {
          id: raw.id,
          name: raw.name,
          slug: raw.slug,
          description: raw.description || '',
          shortDescription: raw.shortDescription || raw.description || '',
          longDescription: raw.longDescription || raw.description || '',
          members: raw.members || 0,
          category: raw.category || 'Club',
          gradient: raw.gradient || 'from-accent to-accent/70',
          highlights: raw.highlights || [],
          board: raw.board || [],
          events: raw.events || [],
          achievements: raw.achievements || [],
          contact: raw.contact || {},
          published: true,
        } as ClubDoc;
      }
      return null;
    }
    const data = parsed.data;
    return {
      ...data,
      id: raw.id,
      shortDescription: data.shortDescription || data.description || '',
      longDescription: data.longDescription || data.description || '',
      highlights: data.highlights || [],
      board: data.board || [],
      events: data.events || [],
      achievements: data.achievements || [],
      contact: data.contact || {},
      gradient: data.gradient || 'from-accent to-accent/70',
    } as ClubDoc;
  } catch (e: any) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[ClubPage] fetch error', e?.code, e?.message);
    }
    return null;
  }
}

export default async function ClubPage({ params }: Props) {
  const { slug } = await params;
  const club = await fetchClub(slug);
  if (!club) return notFound();
  const Icon = pickIcon(club);

  // Defensive defaults
  const highlights = (club.highlights || []) as any[];
  const achievements = (club.achievements || []) as any[];
  const events = (club.events || []) as any[];
  const board = (club.board || []) as any[];
  const contact: any = club.contact || {};
  const gradient = club.gradient || 'from-accent to-accent/70';

  return (
    <div className="relative min-h-screen pb-32">
      {/* Ambient gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br ${gradient} opacity-20 blur-3xl rounded-full`} />
        <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr ${gradient} opacity-10 blur-3xl rounded-full`} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-14">
          <div className="flex items-start gap-6">
            <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>            
              <Icon className="w-14 h-14 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-white/10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-accent to-foreground gradient-shift">
                {club.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Users className="w-4 h-4 text-accent" /> {(club.members || 0)}+ members</span>
                {club.category && <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">{club.category}</span>}
              </div>
              <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">{club.shortDescription || ''}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {contact.joinForm && (
              <Button asChild className="relative overflow-hidden bg-gradient-to-r from-accent to-accent/80">
                <Link href={contact.joinForm}>Join Now</Link>
              </Button>
            )}
            {contact.discord && (
              <Button asChild variant="outline">
                <Link href={contact.discord} target="_blank" className="inline-flex items-center gap-1">
                  Discord <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
            )}
            {contact.email && (
              <Button variant="ghost" asChild>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2"><Mail className="w-4 h-4" /> Email</a>
              </Button>
            )}
          </div>
        </div>

        {/* Long description */}
        <div className="prose dark:prose-invert max-w-none mb-16 prose-headings:font-headline">
          <p className="text-foreground/90 text-lg leading-relaxed">{club.longDescription || club.shortDescription || ''}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Highlights */}
          <div className="lg:col-span-2 space-y-10">
            {highlights.length > 0 && (
              <section>
                <h2 className="text-2xl font-headline font-semibold mb-5 flex items-center gap-2">
                  Highlights
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {highlights.map((h: any, i: number) => (
                    <Card key={i} className="relative group overflow-hidden border border-border/60 hover:border-accent/40 transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-accent/10 group-hover:to-accent/0 transition-colors" />
                      <CardContent className="p-6 relative z-10">
                        <h3 className="font-medium mb-2 text-foreground/90 group-hover:text-accent transition-colors">{h.title || '—'}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{h.description || ''}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements Carousel */}
            {achievements.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-headline font-semibold">Achievements</h2>
                </div>
                <Carousel opts={{ align:'start', loop:true }} className="group/achieve">
                  <CarouselContent className="-ml-4">
                    {achievements.map((a: any, i: number) => (
                      <CarouselItem key={i} className="pl-4 md:basis-2/3 lg:basis-1/2 xl:basis-1/3">
                        <Card className="overflow-hidden h-full group relative border border-border/60 hover:border-accent/40 transition-colors">
                          <div className="relative h-48 w-full overflow-hidden">
                            {a.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.image} alt={a.title || 'Achievement'} className="object-cover w-full h-full transform group-hover:scale-105 transition duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground bg-accent/5">No Image</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                            {a.highlight && (
                              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-medium shadow">Featured</span>
                            )}
                            {a.year && (
                              <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/70 backdrop-blur text-xs font-medium border border-border/50">{a.year}</span>
                            )}
                          </div>
                          <CardContent className="p-5 space-y-2">
                            <h3 className="font-medium text-foreground/90 group-hover:text-accent transition-colors leading-snug">{a.title || 'Untitled'}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{a.description || ''}</p>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </section>
            )}

            {/* Events */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" /> Events
                </h2>
              </div>
              <div className="space-y-4">
                {events.length === 0 && (
                  <p className="text-sm text-muted-foreground">No events listed yet.</p>
                )}
                {events.map((e: any, i: number) => {
                  const date = e.date ? new Date(e.date) : null;
                  const formatted = date ? date.toLocaleDateString(undefined,{ month:'short', day:'numeric'}) : '';
                  const parts = formatted.split(' ');
                  return (
                    <Card key={i} className="group relative overflow-hidden border border-border/60 hover:border-accent/40 transition-colors">
                      <CardContent className="p-5 flex items-start gap-5">
                        <div className="flex flex-col items-center w-16 shrink-0">
                          <span className="text-sm font-semibold text-accent">{parts[0] || ''}</span>
                          <span className="text-xl font-bold -mt-1">{parts[1] || ''}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="font-medium text-foreground/90 group-hover:text-accent transition-colors">{e.title || 'Untitled Event'}</h3>
                            {e.status && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide border ${e.status==='upcoming'?'text-green-500 border-green-500/30 bg-green-500/5': e.status==='past'?'text-muted-foreground border-border bg-muted/10':'text-yellow-500 border-yellow-500/30 bg-yellow-500/5'}`}>{e.status}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{e.description || ''}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            {/* Board Members */}
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-5">Board</h2>
              <div className="space-y-4">
                {board.length === 0 && <p className="text-sm text-muted-foreground">No board members listed.</p>}
                {board.map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-sm overflow-hidden`}>                       
                        {m.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatar} alt={m.name || 'Member'} className="w-full h-full object-cover rounded-full" />
                        ) : (m.name ? m.name.split(' ').map((p:string)=>p[0]).slice(0,2).join('') : '?')}
                      </div>
                      <div className="absolute inset-0 rounded-full ring-2 ring-accent/0 group-hover:ring-accent/40 transition" />
                    </div>
                    <div>
                      <p className="font-medium leading-tight group-hover:text-accent transition-colors">{m.name || 'Unnamed'}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{m.role || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-5">Connect</h2>
              <Card className="border border-border/60">
                <CardContent className="p-5 space-y-4">
                  <ul className="space-y-2 text-sm">
                    {contact.email && <li><a className="hover:text-accent" href={`mailto:${contact.email}`}>{contact.email}</a></li>}
                    {contact.discord && <li><a className="hover:text-accent" href={contact.discord} target="_blank">Discord Server</a></li>}
                    {contact.instagram && <li><a className="hover:text-accent" href={contact.instagram} target="_blank">Instagram</a></li>}
                    {contact.website && <li><a className="hover:text-accent" href={contact.website} target="_blank">Website</a></li>}
                  </ul>
                  {contact.joinForm && (
                    <Button asChild size="sm" className="w-full bg-gradient-to-r from-accent to-accent/80">
                      <Link href={contact.joinForm}>Apply / Join</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Stats */}
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-5">Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-border/60">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold mt-1">{(club.members || 0)}+</p>
                  </CardContent>
                </Card>
                <Card className="border border-border/60">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Events</p>
                    <p className="text-2xl font-bold mt-1">{events.length}</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </aside>
        </div>

        <Separator className="my-20" />

        {/* Call to action */}
        <div className="text-center">
          <h3 className="text-2xl font-headline font-semibold mb-4">Ready to get involved?</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Join the {club.name} and collaborate with passionate peers on meaningful projects and experiences.</p>
          {contact.joinForm && (
            <Button asChild size="lg" className="relative overflow-hidden bg-gradient-to-r from-accent to-accent/80">
              <Link href={contact.joinForm}>Become a Member</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
