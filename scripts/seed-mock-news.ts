/*
  Simple mock news seeding script.
  Inserts a set of news articles matching the newsArticleSchema used in the app.

  Usage:
    node scripts/seed-mock-news.ts --key serviceAccountKey.json
    (or via package script) npm run seed:mock-news

  Flags:
    --key PATH   Explicit service account key path (else GOOGLE_APPLICATION_CREDENTIALS)
    --reset      Delete existing articles with same headlines before inserting
    --upsert     Update existing (matched by headline) instead of skipping

  Matching Strategy:
    Headlines act as a unique key for mock data convenience.
*/
import fs from 'fs';
import path from 'path';
import process from 'process';
import admin from 'firebase-admin';

interface Args { key?: string; reset?: boolean; upsert?: boolean; }
function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = {};
  for (let i=0;i<argv.length;i++) {
    const a = argv[i];
    if (a === '--key') args.key = argv[++i];
    else if (a === '--reset') args.reset = true;
    else if (a === '--upsert') args.upsert = true;
  }
  return args;
}

async function initAdmin(keyPath?: string) {
  if (!admin.apps.length) {
    let credPath = keyPath || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credPath) throw new Error('Service account key path not provided. Use --key or set GOOGLE_APPLICATION_CREDENTIALS');
    credPath = path.resolve(credPath);
    if (!fs.existsSync(credPath)) throw new Error('Service account key file not found: ' + credPath);
    const serviceJson = JSON.parse(fs.readFileSync(credPath,'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceJson) });
  }
  return admin.firestore();
}

// Mock Articles
// Use realistic fields; images can be placeholder URLs.
const nowISO = new Date().toISOString();
const mockArticles = [
  {
    headline: 'Robotics Team Advances to International Finals',
    summary: 'After a decisive victory at the national level, the university robotics team prepares for the global stage.',
    category: 'Campus',
    image: 'https://picsum.photos/seed/robotics-final/800/600',
    readTime: '3 min',
    trending: true,
    published: true,
    featured: true,
    publishedAt: nowISO,
    content: 'The robotics team secured first place... (full article body placeholder)',
  },
  {
    headline: 'AI Society Launches Open LLM Study Pod',
    summary: 'Weekly collaborative sessions to explore transformer internals and fine-tuning techniques.',
    category: 'Technology',
    image: 'https://picsum.photos/seed/ai-society/800/600',
    readTime: '4 min',
    trending: false,
    published: true,
    featured: false,
    publishedAt: nowISO,
    content: 'The AI Society announced a structured curriculum...'
  },
  {
    headline: 'Green Earth Collective Reports 30% Waste Reduction',
    summary: 'Pilot zero-waste initiative shows significant impact across campus common areas.',
    category: 'Sustainability',
    image: 'https://picsum.photos/seed/green-earth/800/600',
    readTime: '2 min',
    trending: true,
    published: true,
    featured: false,
    publishedAt: nowISO,
    content: 'Data collected over eight weeks indicates...'
  },
  {
    headline: 'Design Collective Hosts Portfolio Night Success',
    summary: 'Students refined case studies with real-time critique from industry mentors.',
    category: 'Creative',
    image: 'https://picsum.photos/seed/design-night/800/600',
    readTime: '5 min',
    trending: false,
    published: true,
    featured: false,
    publishedAt: nowISO,
    content: 'Over 40 reviews were conducted, leading to...'
  },
  {
    headline: 'Quantum Circle Demos Variational Circuit Prototype',
    summary: 'Members showcased early results in optimization-focused quantum experiments.',
    category: 'Research',
    image: 'https://picsum.photos/seed/quantum-circle/800/600',
    readTime: '3 min',
    trending: false,
    published: true,
    featured: false,
    publishedAt: nowISO,
    content: 'The prototype leverages parameterized gates...'
  },
];

function mapArticle(raw: any) {
  const ts = admin.firestore.FieldValue.serverTimestamp();
  return {
    headline: raw.headline,
    summary: raw.summary || '',
    category: raw.category || 'General',
    image: raw.image || '',
    hint: raw.hint || '',
    readTime: raw.readTime || '',
    trending: !!raw.trending,
    published: raw.published !== false,
    featured: !!raw.featured,
    publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : ts,
    content: raw.content || '',
    clubId: raw.clubId || '',
    createdAt: ts,
    updatedAt: ts,
  };
}

async function run() {
  const args = parseArgs();
  const db = await initAdmin(args.key);
  const col = db.collection('news');

  const headlines = mockArticles.map(a => a.headline);

  if (args.reset) {
    console.log('Reset: deleting existing articles with mock headlines');
    // Batch delete by querying each headline (Firestore lacks OR without in clause; use in up to 10)
    const chunks: string[][] = [];
    for (let i=0;i<headlines.length;i+=10) chunks.push(headlines.slice(i,i+10));
    for (const ch of chunks) {
      const snap = await col.where('headline','in', ch).get();
      for (const d of snap.docs) { await d.ref.delete(); console.log('Deleted', d.get('headline')); }
    }
  }

  let created = 0, skipped = 0, updated = 0;
  for (const art of mockArticles) {
    const existing = await col.where('headline','==', art.headline).limit(1).get();
    if (!existing.empty) {
      if (args.upsert) {
        await existing.docs[0].ref.set({ ...mapArticle(art), createdAt: existing.docs[0].get('createdAt') || admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        console.log('Updated', art.headline);
        updated++;
      } else {
        console.log('Skip existing', art.headline);
        skipped++;
      }
      continue;
    }
    await col.add(mapArticle(art));
    console.log('Created', art.headline);
    created++;
  }

  console.log('Done.', { created, skipped, updated });
  if (skipped>0) console.log('Use --upsert to update existing records.');
}

run().catch(e => { console.error(e); process.exit(1); });
