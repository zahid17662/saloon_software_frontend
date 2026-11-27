import type { MetadataRoute } from "next";
import { SITE_URL } from "@/site/url";

// The public website may be indexed; the staff screens should not show up in search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/pos", "/admin", "/barber", "/barber-login", "/receipt", "/unlock"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
