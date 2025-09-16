import { cookies, headers } from 'next/headers';

const CSRF_COOKIE = 'csrf_token';

export async function assertCsrf() {
  const jar = await cookies();
  const h = await headers();
  const cookieToken = jar.get(CSRF_COOKIE)?.value;
  const headerToken = h.get('x-csrf-token');

  const origin = h.get('origin');
  const referer = h.get('referer');
  const expectedOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new Error('Invalid CSRF token');
  }
  if (expectedOrigin) {
    if (origin && origin !== expectedOrigin) throw new Error('Bad Origin');
    if (referer && !referer.startsWith(expectedOrigin)) throw new Error('Bad Referer');
  }
}
