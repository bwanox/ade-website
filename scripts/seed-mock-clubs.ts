/*
  Simple mock clubs seeding script.
  Creates 4 club documents with the full schema expected by the CMS/front-end.

  Usage:
    1. Place your Firebase service account key JSON at project root as serviceAccountKey.json (or pass --key path)
    2. Run: pnpm install (ensure firebase-admin present)
    3. Execute: pnpm seed:mock-clubs  (or: tsx scripts/seed-mock-clubs.ts --key serviceAccountKey.json)

  Options:
    --key PATH   Explicit service account key path (otherwise GOOGLE_APPLICATION_CREDENTIALS is used)
    --reset      Delete any existing documents whose slug matches the mock slugs before inserting

*/
import fs from 'fs';
import path from 'path';
import process from 'process';
import admin from 'firebase-admin';

interface Args { key?: string; reset?: boolean; }
function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = {};
  for (let i=0;i<argv.length;i++) {
    const a = argv[i];
    if (a === '--key') args.key = argv[++i];
    else if (a === '--reset') args.reset = true;
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

const mockClubs = [
  {
    name: 'Tech Innovators',
    slug: 'tech-innovators',
    shortDescription: 'Exploring emerging technologies together.',
    longDescription: 'Tech Innovators is a community of students passionate about experimenting with cutting-edge tools: AI, AR/VR, blockchain, and more. We host demo nights, rapid prototyping sprints, and collaborative builds that turn ideas into tangible proof-of-concepts.',
    members: 60,
    category: 'Technology',
    gradient: 'from-sky-500 to-cyan-500',
    highlights: [
      { title: 'Prototype Nights', description: 'Weekly hands-on building sessions.' },
      { title: 'Demo Day', description: 'Showcase member projects each month.' }
    ],
    board: [
      { name: 'Lina H.', role: 'President', avatar: '', avatarPath: '' },
      { name: 'Omar J.', role: 'Projects Lead', avatar: '', avatarPath: '' }
    ],
    events: [
      { date: '2025-09-20', title: 'AR/VR Ideation Jam', description: 'Brainstorm immersive app concepts.', status: 'upcoming' },
      { date: '2025-10-10', title: 'Edge AI Sprint', description: 'Hack on on-device inference.', status: 'upcoming' }
    ],
    achievements: [
      { title: 'Campus Innovation Grant', description: 'Received seed funding for open lab initiative.', image: '', year: 2025, highlight: true }
    ],
    contact: { email: 'innovators@campus.edu', discord: '#', joinForm: '#' },
  },
  {
    name: 'Green Earth Collective',
    slug: 'green-earth',
    shortDescription: 'Sustainability advocacy and environmental action.',
    longDescription: 'We drive impact through clean-up campaigns, sustainability workshops, and data-driven environmental monitoring projects. Members learn to apply science, policy, and tech to real ecological challenges.',
    members: 75,
    category: 'Environment',
    gradient: 'from-green-600 to-emerald-500',
    highlights: [
      { title: 'Campus Tree Mapping', description: 'Cataloging species + air quality correlation.' },
      { title: 'Zero-Waste Drives', description: 'Monthly waste audit & reduction campaigns.' }
    ],
    board: [
      { name: 'Rania S.', role: 'Coordinator', avatar: '', avatarPath: '' },
      { name: 'Oussama T.', role: 'Outreach', avatar: '', avatarPath: '' }
    ],
    events: [
      { date: '2025-09-14', title: 'Sustainability Kickoff', description: 'Goals + working groups.', status: 'upcoming' },
      { date: '2025-10-04', title: 'River Clean-Up', description: 'Field action day.', status: 'upcoming' }
    ],
    achievements: [
      { title: 'Carbon Footprint Dashboard', description: 'Built internal tracker for campus events.', image: '', year: 2024 }
    ],
    contact: { email: 'green@campus.edu', instagram: '#', joinForm: '#' },
  },
  {
    name: 'Creative Media Lab',
    slug: 'creative-media-lab',
    shortDescription: 'Storytelling through film, audio, and digital media.',
    longDescription: 'A collaborative studio for filmmakers, podcasters, and visual artists. We produce mini docs, experimental shorts, and narrative audio while teaching lighting, editing, and post-production workflows.',
    members: 55,
    category: 'Arts & Media',
    gradient: 'from-fuchsia-500 to-pink-500',
    highlights: [
      { title: 'Micro Film Festival', description: 'Quarterly screening of member projects.' },
      { title: 'Podcast Incubator', description: 'Mentorship for serialized audio storytelling.' }
    ],
    board: [
      { name: 'Sami K.', role: 'Director', avatar: '', avatarPath: '' },
      { name: 'Dina M.', role: 'Production Lead', avatar: '', avatarPath: '' }
    ],
    events: [
      { date: '2025-09-22', title: 'Cinematography 101', description: 'Camera + framing fundamentals.', status: 'upcoming' },
      { date: '2025-10-18', title: 'Audio Story Lab', description: 'Field recording & mixing.', status: 'upcoming' }
    ],
    achievements: [
      { title: 'Festival Selection', description: 'Short film accepted to regional student fest.', image: '', year: 2025, highlight: true }
    ],
    contact: { email: 'media@campus.edu', instagram: '#', joinForm: '#' },
  },
  {
    name: 'Quantum Computing Circle',
    slug: 'quantum-circle',
    shortDescription: 'Learning and experimenting with quantum algorithms.',
    longDescription: 'We explore qubits, gates, and algorithms through workshops and coding labs using open quantum SDKs. Beginners welcome—foundations to simulation to prototype research explorations.',
    members: 40,
    category: 'Research',
    gradient: 'from-indigo-600 to-purple-600',
    highlights: [
      { title: 'Weekly Theory Sessions', description: 'Linear algebra + algorithm walkthroughs.' },
      { title: 'QSVM Demo', description: 'Applied quantum classification experiments.' }
    ],
    board: [
      { name: 'Yasmine O.', role: 'Lead', avatar: '', avatarPath: '' },
      { name: 'Hadi N.', role: 'Workshop Mentor', avatar: '', avatarPath: '' }
    ],
    events: [
      { date: '2025-09-19', title: 'Intro to Qubits', description: 'Foundations & intuition.', status: 'upcoming' },
      { date: '2025-10-25', title: 'Quantum SDK Lab', description: 'Hands-on session.', status: 'upcoming' }
    ],
    achievements: [
      { title: 'Hackathon Prototype', description: 'Built variational circuit demo.', image: '', year: 2025 }
    ],
    contact: { email: 'quantum@campus.edu', discord: '#', joinForm: '#' },
  },
];

function mapToFirestore(club: any) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  return {
    name: club.name,
    slug: club.slug,
    description: club.shortDescription,
    shortDescription: club.shortDescription,
    longDescription: club.longDescription,
    members: club.members,
    category: club.category,
    gradient: club.gradient,
    logoUrl: '',
    logoStoragePath: '',
    highlights: club.highlights,
    board: club.board,
    events: club.events,
    achievements: club.achievements || [],
    contact: club.contact || {},
    published: true,
    featured: false,
    icon: '',
    createdAt: now,
    updatedAt: now,
  };
}

async function run() {
  const args = parseArgs();
  const db = await initAdmin(args.key);
  const col = db.collection('clubs');
  const slugs = mockClubs.map(c=>c.slug);

  if (args.reset) {
    console.log('Reset enabled: deleting existing docs with these slugs:', slugs.join(', '));
    const snap = await col.where('slug','in', slugs.slice(0,10)).get(); // Firestore limits 'in' to 10 values
    for (const d of snap.docs) {
      await d.ref.delete();
      console.log('Deleted existing', d.get('slug'));
    }
  }

  let created = 0, skipped = 0, updated = 0;
  for (const mc of mockClubs) {
    const existing = await col.where('slug','==', mc.slug).limit(1).get();
    if (!existing.empty) {
      // keep existing; skip (or could update)
      console.log(`Skip existing slug=${mc.slug}`);
      skipped++;
      continue;
    }
    await col.add(mapToFirestore(mc));
    created++;
    console.log('Created club', mc.slug);
  }

  console.log('Done.', { created, skipped, updated });
}

run().catch(e=>{ console.error(e); process.exit(1); });
