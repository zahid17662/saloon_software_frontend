import "server-only";

// The public address of the website, used for the canonical link, the sitemap and the share image.
// Set SITE_URL in the Vercel project (for example https://www.your-domain.com) once the real domain is
// connected. Until then the Vercel address below is used.
export const SITE_URL = (process.env.SITE_URL || "https://saloon-software-frontend.vercel.app").replace(/\/+$/, "");
