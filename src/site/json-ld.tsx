import { SITE } from "./config";
import { SITE_URL } from "./url";

// Search-engine "local business" data. It is built only from src/site/config.ts, so an item you left
// empty there is simply left out (nothing is invented). Opening hours are free text in config.ts and
// are not turned into structured hours for the same reason.
export function businessData() {
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: SITE.name,
    url: SITE_URL,
    image: `${SITE_URL}/images/hero.jpg`,
    description: "Haircut, beard, hair colour, facial, hair treatment and massage chair services for men.",
    ...(SITE.phone && { telephone: SITE.phone }),
    ...(SITE.address && { address: { "@type": "PostalAddress", streetAddress: SITE.address } }),
  };
}

// The one place that writes raw JSON into the page. The data comes from our own config, and "<" is
// escaped so it can never close the script tag.
export function JsonLd() {
  const json = JSON.stringify(businessData()).replace(/</g, "\\u003c"); // backslash + u003c: JSON still reads it as "<"
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
