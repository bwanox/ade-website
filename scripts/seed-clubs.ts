/*
 Seed script for clubs collection.
 Usage:
   1. Place your Firebase service account key JSON at project root (or anywhere) and set GOOGLE_APPLICATION_CREDENTIALS env var OR use --key path.
   2. Run: pnpm install (to ensure firebase-admin) then:
        npx tsx scripts/seed-clubs.ts --key serviceAccountKey.json
      Options:
        --update   Upsert (update existing by slug) instead of skipping.
        --dry      Dry run (no writes).
        --key PATH Explicit service account json path (if GOOGLE_APPLICATION_CREDENTIALS not set).
        --force    Force create even if duplicate slug (will create additional doc) – not recommended.

 Maps fields from src/lib/clubs.ts to Firestore schema expected by CMS & frontend.
 Adds published:true by default (toggle with --draft to set published:false).
*/

import fs from 'fs';
import path from 'path';
import process from 'process';
import admin from 'firebase-admin';
import { clubs } from '../src/lib/clubs';

interface Args {
  update: boolean;
  dry: boolean;
  force: boolean;
  draft: boolean;
  key?: string;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { update:false, dry:false, force:false, draft:false } as Args;
  for (let i=0;i<argv.length;i++) {
    const a = argv[i];
    if (a === '--update') args.update = true;
    else if (a === '--dry') args.dry = true;
    else if (a === '--force') args.force = true;
    else if (a === '--draft') args.draft = true;
    else if (a === '--key') args.key = argv[++i];
  }
  return args;
}

async function initAdmin(keyPath?: string) {
  if (!admin.apps.length) {
    let credPath = keyPath || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credPath) {
      throw new Error('Service account key path not provided. Use --key or set GOOGLE_APPLICATION_CREDENTIALS');
    }
    credPath = path.resolve(credPath);
    if (!fs.existsSync(credPath)) throw new Error('Service account key file not found: ' + credPath);
    const serviceJson = JSON.parse(fs.readFileSync(credPath,'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceJson) });
  }
  return admin.firestore();
}

function transform(club: any, published: boolean) {
  return {
    name: club.name,
    slug: club.slug,
    // CMS uses description as short summary; we map shortDescription source -> description
    description: club.shortDescription || club.longDescription?.slice(0,160) || '',
    shortDescription: club.shortDescription || club.shortDescription || '',
    longDescription: club.longDescription || '',
    members: club.members || 0,
    category: club.category || '',
    gradient: club.gradient || '',
    // logo fields left blank (can be updated later via CMS)
    logoUrl: '',
    logoStoragePath: '',
    highlights: (club.highlights || []).map((h: any) => ({ title: h.title || '', description: h.description || '' })),
    board: (club.board || []).map((b: any) => ({ name: b.name || '', role: b.role || '', avatar: b.avatar || '', avatarPath: '' })),
    events: (club.events || []).map((e: any) => ({ date: e.date || '', title: e.title || '', description: e.description || '', status: e.status || '' })),
    achievements: (club.achievements || []).map((a: any) => ({ title: a.title || '', description: a.description || '', image: a.image || '', year: a.year || '', highlight: !!a.highlight })),
    contact: { ...(club.contact || {}) },
    published,
    featured: false,
    icon: '', // optional future use
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function run() {
  const args = parseArgs();
  const db = await initAdmin(args.key);
  const col = db.collection('clubs');

  console.log(`Seeding ${clubs.length} clubs (update mode: ${args.update}, dry: ${args.dry}, draft: ${args.draft})`);

  let created = 0, skipped = 0, updated = 0, errors = 0;

  for (const c of clubs) {
    try {
      if (!c.slug) { console.warn(`Skipping club without slug: ${c.name}`); skipped++; continue; }
      const q = await col.where('slug','==', c.slug).limit(1).get();
      const exists = !q.empty;
      if (exists && !args.update && !args.force) { console.log(`Skip existing slug=${c.slug}`); skipped++; continue; }

      const data = transform(c, !args.draft);
      if (args.dry) { console.log(`[DRY] would ${exists ? 'update' : 'create'} slug=${c.slug}`); continue; }

      if (exists && (args.update || args.force)) {
        const docRef = q.docs[0].ref;
        await docRef.set({ ...data, createdAt: q.docs[0].get('createdAt') || data.createdAt }, { merge: true });
        console.log(`Updated club slug=${c.slug}`);
        updated++;
      } else {
        await col.add(data);
        console.log(`Created club slug=${c.slug}`);
        created++;
      }
    } catch (e: any) {
      console.error(`Error processing club slug=${c.slug}:`, e.message || e);
      errors++;
    }
  }

  console.log('--- Summary ---');
  console.log({ created, updated, skipped, errors });
  if (errors > 0) process.exitCode = 1;
}

run().catch(e => { console.error(e); process.exit(1); });
