import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { assertCsrf } from '@/lib/csrf';

const SESSION_COOKIE_NAME = '__session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24; // 24 hours

export async function POST(req: Request) {
  try {
    await assertCsrf();
    const { idToken } = await req.json();

    if (!idToken) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    // Verify ID token (ensures it belongs to this project)
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded?.uid) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SEC * 1000,
    });

    const res = new NextResponse(null, { status: 204 });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_MAX_AGE_SEC,
    });
    return res;
  } catch (e: any) {
    const msg = e?.message || 'Unauthorized';
    return new NextResponse(msg, { status: 401 });
  }
}
