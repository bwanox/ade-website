import { NextResponse } from 'next/server';
import { assertCsrf } from '@/lib/csrf';

const SESSION_COOKIE_NAME = '__session';

export async function POST() {
  try {
    await assertCsrf();
  } catch (e) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
