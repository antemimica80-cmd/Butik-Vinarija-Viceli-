/**
 * The site's public origin. NEXT_PUBLIC_SITE_URL wins; on Vercel previews and
 * production it falls back to the deployment's own domain, so a fresh deploy
 * works with no configuration.
 */
export function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

/** Writable local folder for the embedded database and email outbox (Vercel only allows /tmp). */
export function dataDir() {
  return process.env.VERCEL ? '/tmp/vicelic' : '.data';
}
