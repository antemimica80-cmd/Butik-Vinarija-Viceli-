import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/*/experience/checkout', '/*/experience/booked', '/*/degustacije/placanje', '/*/degustacije/potvrda', '/*/shop/cart', '/*/shop/checkout', '/*/shop/ordered', '/*/trgovina/kosarica', '/*/trgovina/placanje', '/*/trgovina/potvrda', '/*/design'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
