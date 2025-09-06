import type {NextConfig} from 'next';

const isProd = process.env.NODE_ENV === 'production';

function buildCsp() {
  const directives: string[] = [];
  directives.push("default-src 'self'");
  directives.push("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googletagmanager.com blob:");
  directives.push("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com");
  directives.push("font-src 'self' https://fonts.gstatic.com data:");
  directives.push("img-src 'self' data: blob: https://placehold.co https://picsum.photos https://firebasestorage.googleapis.com https://storage.googleapis.com");
  directives.push("connect-src 'self' https://firestore.googleapis.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://fonts.googleapis.com https://fonts.gstatic.com ws: wss: http://localhost:3000 http://localhost:9002 https://localhost:3000 https://localhost:9002");
  directives.push("frame-src 'self'");
  directives.push("object-src 'none'");
  directives.push("base-uri 'self'");
  directives.push("form-action 'self'");
  if (isProd) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: buildCsp(),
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      }
    ];
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react'
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // Consider setting to false to enforce type safety in production
  },
  eslint: {
    ignoreDuringBuilds: true, // Consider fixing lint errors and removing this for CI
  },
};

export default nextConfig;
