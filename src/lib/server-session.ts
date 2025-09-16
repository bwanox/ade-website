import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';

export type Session = {
  uid: string;
  email?: string;
  role?: string;
  clubId?: string;
  [k: string]: any;
} | null;

const SESSION_COOKIE_NAME = '__session';

export async function getServerSession(): Promise<Session> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    // If using custom claims, surface them here
    const { uid, email, role, clubId, ...rest } = decoded as any;
    return { uid, email, role, clubId, ...rest };
  } catch {
    return null;
  }
}
