import type { MetadataRoute } from "next";
import { SITE_URL } from "@/site/url";

// Only the public website is listed. The staff screens are not public and are not indexed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/book`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/offers`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
