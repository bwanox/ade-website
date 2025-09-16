import { NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_COOKIE = 'csrf_token';

export async function GET() {
  const token = crypto.randomBytes(32).toString('base64url');
  const res = NextResponse.json({ token });
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 2,
  });
  return res;
}
