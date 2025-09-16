// filepath: /Users/bilalsahili/ade-website/scripts/set-claims.ts
/*
  Set Firebase Auth custom claims for a user.

  Usage examples:
    tsx scripts/set-claims.ts --key serviceAccountKey.json --uid <UID> --role admin
    tsx scripts/set-claims.ts --key serviceAccountKey.json --email user@example.com --role club_rep --clubId club-abc

  Notes:
    - You must provide a service account key via --key or GOOGLE_APPLICATION_CREDENTIALS.
    - Claims are visible in ID tokens after the user refreshes their token (sign-out/in).
*/
import fs from 'fs';
import path from 'path';
import process from 'process';
import admin from 'firebase-admin';

interface Args { key?: string; uid?: string; email?: string; role?: string; clubId?: string; }
function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = {};
  for (let i=0; i<argv.length; i++) {
    const a = argv[i];
    if (a === '--key') args.key = argv[++i];
    else if (a === '--uid') args.uid = argv[++i];
    else if (a === '--email') args.email = argv[++i];
    else if (a === '--role') args.role = argv[++i];
    else if (a === '--clubId') args.clubId = argv[++i];
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
}

async function main() {
  const args = parseArgs();
  await initAdmin(args.key);

  if (!args.uid && !args.email) throw new Error('Provide --uid or --email');
  if (!args.role) throw new Error('Provide --role (e.g., admin | club_rep)');

  let uid = args.uid;
  if (!uid && args.email) {
    const user = await admin.auth().getUserByEmail(args.email);
    uid = user.uid;
  }
  if (!uid) throw new Error('Could not resolve UID');

  const claims: any = { role: args.role };
  if (args.clubId) claims.clubId = args.clubId;

  await admin.auth().setCustomUserClaims(uid, claims);
  console.log('Set claims for', uid, claims);

  // Invalidate existing sessions so claims take effect on next sign-in
  await admin.auth().revokeRefreshTokens(uid);
  console.log('Revoked refresh tokens for', uid);
}

main().catch(e => { console.error(e); process.exit(1); });
