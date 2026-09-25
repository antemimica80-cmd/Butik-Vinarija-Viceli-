import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** `STATIC_EXPORT=1` (scripts/build-static.mjs) builds the static GitHub Pages preview. */
const isStatic = process.env.STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: isStatic,
  },
  ...(isStatic ? { output: 'export' as const, trailingSlash: true, basePath } : {}),
};

export default withNextIntl(nextConfig);
