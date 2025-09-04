# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Seeding Clubs Data
A seed script is available to bulk insert the mock clubs from `src/lib/clubs.ts` into Firestore.

### 1. Create a Firebase service account key
In the Firebase Console (Project Settings > Service Accounts) generate a new key and download the JSON file. Save it locally (e.g. `serviceAccountKey.json`). Do NOT commit it.

(Optional) Add to your `.gitignore` if not already ignored:
```
serviceAccountKey.json
```

### 2. Install dependencies
`firebase-admin` has been added to `package.json`. Install dependencies if you have not since pulling the change.

### 3. Run the seed script
```
npm run seed:clubs -- --key serviceAccountKey.json
```
Flags:
- `--update`  Update existing clubs that share the same slug (upsert).
- `--dry`     Dry run (prints actions without writing).
- `--draft`   Seed with `published:false` (default seeds with `published:true`).
- `--force`   Force create even if slug exists (avoid normally).
- `--key`     Path to service account key (otherwise use env var `GOOGLE_APPLICATION_CREDENTIALS`).

Examples:
- Dry run: `npm run seed:clubs -- --dry`
- Upsert using env var: `GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json npm run seed:clubs -- --update`
- Seed as drafts: `npm run seed:clubs -- --draft`

The script maps:
- `shortDescription` -> both `description` and `shortDescription` fields.
- Adds `published`, `featured:false`, timestamps, and empty logo fields.

After seeding, the frontend carousel will immediately show clubs (it queries `published == true`).
