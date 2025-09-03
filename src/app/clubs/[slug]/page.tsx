import { notFound } from 'next/navigation';
import { getClubBySlug, clubs } from '@/lib/clubs';
import { Users, Calendar, ArrowLeft, ExternalLink, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return clubs.map(c => ({ slug: c.slug }));
}

export default function ClubPage({ params }: Props) {
  const club = getClubBySlug(params.slug);
  if (!club) return notFound();
  const Icon = club.icon;

  return (
    <div className="relative min-h-screen pb-32">
      {/* Ambient gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br ${club.gradient} opacity-20 blur-3xl rounded-full`} />
        <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr ${club.gradient} opacity-10 blur-3xl rounded-full`} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-14">
          <div className="flex items-start gap-6">
            <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${club.gradient} shadow-lg`}>            
              <Icon className="w-14 h-14 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-white/10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-accent to-foreground gradient-shift">
                {club.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Users className="w-4 h-4 text-accent" /> {club.members}+ members</span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">{club.category}</span>
              </div>
              <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">{club.shortDescription}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {club.contact.joinForm && (
              <Button asChild className="relative overflow-hidden bg-gradient-to-r from-accent to-accent/80">
                <Link href={club.contact.joinForm}>Join Now</Link>
              </Button>
            )}
            {club.contact.discord && (
              <Button asChild variant="outline">
                <Link href={club.contact.discord} target="_blank" className="inline-flex items-center gap-1">
                  Discord <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
            )}
            {club.contact.email && (
              <Button variant="ghost" asChild>
                <a href={`mailto:${club.contact.email}`} className="inline-flex items-center gap-2"><Mail className="w-4 h-4" /> Email</a>
              </Button>
            )}
          </div>
        </div>

        {/* Long description */}
        <div className="prose dark:prose-invert max-w-none mb-16 prose-headings:font-headline">
          <p className="text-foreground/90 text-lg leading-relaxed">{club.longDescription}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Highlights */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-headline font-semibold mb-5 flex items-center gap-2">
                Highlights
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {club.highlights.map((h,i) => (
                  <Card key={i} className="relative group overflow-hidden border border-border/60 hover:border-accent/40 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-accent/10 group-hover:to-accent/0 transition-colors" />
                    <CardContent className="p-6 relative z-10">
                      <h3 className="font-medium mb-2 text-foreground/90 group-hover:text-accent transition-colors">{h.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Achievements Carousel */}
            {club.achievements && club.achievements.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-headline font-semibold">Achievements</h2>
                </div>
                <Carousel opts={{ align:'start', loop:true }} className="group/achieve">
                  <CarouselContent className="-ml-4">
                    {club.achievements.map((a,i)=>(
                      <CarouselItem key={i} className="pl-4 md:basis-2/3 lg:basis-1/2 xl:basis-1/3">
                        <Card className="overflow-hidden h-full group relative border border-border/60 hover:border-accent/40 transition-colors">
                          <div className="relative h-48 w-full overflow-hidden">
                            <img src={a.image} alt={a.title} className="object-cover w-full h-full transform group-hover:scale-105 transition duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                            {a.highlight && (
                              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-medium shadow">Featured</span>
                            )}
                            {a.year && (
                              <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/70 backdrop-blur text-xs font-medium border border-border/50">{a.year}</span>
                            )}
                          </div>
                          <CardContent className="p-5 space-y-2">
                            <h3 className="font-medium text-foreground/90 group-hover:text-accent transition-colors leading-snug">{a.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{a.description}</p>
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
                {club.events.map((e,i) => {
                  const date = new Date(e.date);
                  const formatted = date.toLocaleDateString(undefined,{ month:'short', day:'numeric'});
                  return (
                    <Card key={i} className="group relative overflow-hidden border border-border/60 hover:border-accent/40 transition-colors">
                      <CardContent className="p-5 flex items-start gap-5">
                        <div className="flex flex-col items-center w-16 shrink-0">
                          <span className="text-sm font-semibold text-accent">{formatted.split(' ')[0]}</span>
                          <span className="text-xl font-bold -mt-1">{formatted.split(' ')[1]}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="font-medium text-foreground/90 group-hover:text-accent transition-colors">{e.title}</h3>
                            {e.status && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide border ${e.status==='upcoming'?'text-green-500 border-green-500/30 bg-green-500/5': e.status==='past'?'text-muted-foreground border-border bg-muted/10':'text-yellow-500 border-yellow-500/30 bg-yellow-500/5'}`}>{e.status}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>
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
                {club.board.map((m,i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${club.gradient} flex items-center justify-center text-white font-semibold text-sm`}>
                        {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover rounded-full"/> : m.name.split(' ').map(p=>p[0]).slice(0,2).join('')}
                      </div>
                      <div className="absolute inset-0 rounded-full ring-2 ring-accent/0 group-hover:ring-accent/40 transition" />
                    </div>
                    <div>
                      <p className="font-medium leading-tight group-hover:text-accent transition-colors">{m.name}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{m.role}</p>
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
                    {club.contact.email && <li><a className="hover:text-accent" href={`mailto:${club.contact.email}`}>{club.contact.email}</a></li>}
                    {club.contact.discord && <li><a className="hover:text-accent" href={club.contact.discord} target="_blank">Discord Server</a></li>}
                    {club.contact.instagram && <li><a className="hover:text-accent" href={club.contact.instagram} target="_blank">Instagram</a></li>}
                    {club.contact.website && <li><a className="hover:text-accent" href={club.contact.website} target="_blank">Website</a></li>}
                  </ul>
                  {club.contact.joinForm && (
                    <Button asChild size="sm" className="w-full bg-gradient-to-r from-accent to-accent/80">
                      <Link href={club.contact.joinForm}>Apply / Join</Link>
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
                    <p className="text-2xl font-bold mt-1">{club.members}+</p>
                  </CardContent>
                </Card>
                <Card className="border border-border/60">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Events</p>
                    <p className="text-2xl font-bold mt-1">{club.events.length}</p>
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
            {club.contact.joinForm && (
              <Button asChild size="lg" className="relative overflow-hidden bg-gradient-to-r from-accent to-accent/80">
                <Link href={club.contact.joinForm}>Become a Member</Link>
              </Button>
            )}
        </div>
      </div>
    </div>
  )
}
