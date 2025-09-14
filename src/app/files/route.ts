// Simple proxy to serve public Firebase Storage files via App/Hosting CDN with long-term caching.
// Usage: /files?u=<public_download_url>

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_HOSTS = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
]);

function sanitizeTarget(uParam: string | null): URL | null {
  if (!uParam) return null;
  try {
    const target = new URL(uParam);
    if (!ALLOWED_HOSTS.has(target.hostname)) return null;
    // Only allow HTTPS
    if (target.protocol !== 'https:') return null;
    return target;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const uParam = url.searchParams.get('u');
  const target = sanitizeTarget(uParam);
  if (!target) {
    return new Response('Bad Request', { status: 400 });
  }

  // Forward only a safe subset of headers (Range for media seeking)
  const fwdHeaders: HeadersInit = {};
  const range = req.headers.get('range');
  if (range) (fwdHeaders as any)['Range'] = range;
  const ifNoneMatch = req.headers.get('if-none-match');
  if (ifNoneMatch) (fwdHeaders as any)['If-None-Match'] = ifNoneMatch;
  const ifModifiedSince = req.headers.get('if-modified-since');
  if (ifModifiedSince) (fwdHeaders as any)['If-Modified-Since'] = ifModifiedSince;

  const upstream = await fetch(target.toString(), {
    method: 'GET',
    headers: fwdHeaders,
    // Always fetch fresh from origin; CDN will cache our response per headers below
    cache: 'no-store',
    redirect: 'follow',
  });

  // Build response headers
  const headers = new Headers();
  // Copy useful headers from upstream
  const passThroughHeaders = [
    'content-type',
    'content-length',
    'etag',
    'last-modified',
    'accept-ranges',
    'content-range',
  ];
  for (const h of passThroughHeaders) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }

  // Force inline display to avoid download prompts
  const fileNameGuess = decodeURIComponent(target.pathname.split('/').pop() || 'file');
  headers.set('content-disposition', `inline; filename="${fileNameGuess}"`);

  // Strong CDN caching (1 year) while allowing clients to revalidate if needed
  // s-maxage is respected by Firebase CDN; immutable is safe because Storage download URLs are versioned by token.
  headers.set('cache-control', 'public, max-age=0, s-maxage=31536000, immutable, stale-while-revalidate=86400');
  headers.set('x-proxy-target-host', target.hostname);
  headers.set('vary', ['Range', 'Accept-Encoding', 'Origin'].join(', '));
  headers.set('x-content-type-options', 'nosniff');

  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
}
