import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { newsArticleSchema } from '@/types/firestore-content';
import { Calendar, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import DOMPurify from 'isomorphic-dompurify';

// Static params disabled for now (Firestore dynamic data). Could implement SSG with revalidation later.
export const dynamic = 'force-dynamic';

async function fetchArticle(id: string) {
  const ref = doc(db, 'news', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const raw: any = { id: snap.id, ...snap.data() };
  if (raw.publishedAt?.toDate) {
    raw.date = raw.publishedAt.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }
  const parsed = newsArticleSchema.safeParse(raw);
  if (!parsed.success || parsed.data.published === false) return null;
  return { ...parsed.data, id: raw.id, date: raw.date || '' } as any;
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await fetchArticle(id);
  if (!article) return notFound();

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />
        <div className="absolute top-1/3 -left-32 w-[40rem] h-[40rem] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[50rem] h-[50rem] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <header className="pt-16 md:pt-24 pb-6">
        <div className="container max-w-4xl mx-auto px-4">
          <Link href="/#news" className="inline-flex items-center text-sm text-accent hover:underline mb-6"><ArrowLeft className="w-4 h-4 mr-1" /> Back to News</Link>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <Badge variant="secondary" className="backdrop-blur border border-accent/20">{article.category || 'General'}</Badge>
            {article.trending && <Badge className="gap-1"><TrendingUp className="w-3 h-3" /> Trending</Badge>}
            {article.readTime && <Badge variant="outline" className="border-accent/30">{article.readTime}</Badge>}
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift leading-tight">
            {article.headline}
          </h1>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground/80">
            <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {article.date}</span>
            {article.readTime && <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {article.readTime}</span>}
          </div>
          {article.summary && <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">{article.summary}</p>}
        </div>
      </header>

      <main className="pb-24">
        <div className="container max-w-4xl mx-auto px-4 space-y-12">
          <div className="relative h-80 md:h-[30rem] rounded-xl overflow-hidden group shadow-2xl">
            <Image fill src={article.image || `https://picsum.photos/1600/900?random=${article.id}`} alt={article.headline} className="object-cover transition-transform duration-[4000ms] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
          </div>

          <ArticleBody content={article.content} />
        </div>
      </main>
    </div>
  );
}

function ArticleBody({ content }: { content?: string }) {
  if (!content) {
    return (
      <div className="prose prose-invert max-w-none text-muted-foreground/80">
        <p>No full article content available yet.</p>
      </div>
    );
  }
  // If content contains HTML (from TipTap), sanitize and render as HTML.
  const looksLikeHtml = /<\w+|<\/\w+>/.test(content);
  if (looksLikeHtml) {
    const html = DOMPurify.sanitize(content, { ADD_ATTR: ['style'] });
    return (
      <article className="prose prose-invert max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
  // Fallback: render plain paragraphs; could integrate MDX / markdown parser later.
  const paragraphs = content.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return (
    <article className="prose prose-invert max-w-none leading-relaxed">
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </article>
  );
}

export function NewsDetailLoading() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-24 animate-pulse text-muted-foreground/60">
      <div className="h-8 w-2/3 bg-muted/30 rounded mb-4" />
      <div className="h-5 w-1/3 bg-muted/30 rounded mb-8" />
      <div className="h-80 w-full bg-muted/20 rounded mb-12" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 w-full bg-muted/20 rounded" />)}
      </div>
    </div>
  );
}

export function generateMetadata() {
  return { title: 'News Article' };
}
