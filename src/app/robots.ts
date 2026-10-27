import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*/admin", "/hr/vlasnik", "/en/owner", "/hr/racun", "/en/account", "/hr/prijava", "/en/login", "/hr/registracija", "/en/register", "/*/upit", "/*/inquiry"],
    }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
