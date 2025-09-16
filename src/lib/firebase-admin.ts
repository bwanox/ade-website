import admin from 'firebase-admin';

let app: admin.app.App;

function init() {
  if (admin.apps.length) return admin.app();

  const projectIdFromEnv =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    undefined;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  // Prefer explicit service account from env (JSON or base64 JSON)
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  try {
    if (json || b64) {
      const raw = json ? json : Buffer.from(b64 as string, 'base64').toString('utf8');
      const creds = JSON.parse(raw as string);
      const projectId = creds.project_id || projectIdFromEnv;
      return admin.initializeApp({
        credential: admin.credential.cert(creds),
        projectId,
        storageBucket,
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[firebase-admin] Failed parsing FIREBASE_SERVICE_ACCOUNT env', e);
  }

  // Fallback to ADC (GOOGLE_APPLICATION_CREDENTIALS or gcloud ADC). Always pass projectId if available
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: projectIdFromEnv,
    storageBucket,
  });
}

app = init();

export const adminApp = app;
export const adminAuth = app.auth();
export const adminDb = app.firestore();
