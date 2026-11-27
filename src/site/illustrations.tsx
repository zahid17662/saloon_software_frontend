// Real photos — one per service category, used on every service card and the category tiles.
// Free-licensed stock photos (Pexels License: free for commercial use, no attribution required),
// resized and saved locally at build time; see git history for the originals and photographer credits.

import Image from "next/image";
import type { CategoryId } from "./services";

const CATEGORY_PHOTO: Record<CategoryId, { src: string; alt: string }> = {
  hair: { src: "/images/services/hair-cutting.jpg", alt: "Barber cutting a client's hair with scissors and a comb" },
  color: { src: "/images/services/hair-color.jpg", alt: "Hairdresser applying hair colour with a tint brush" },
  facial: { src: "/images/services/facial.jpg", alt: "Man relaxing during a facial treatment with a face mask" },
  treat: { src: "/images/services/hair-treatment.jpg", alt: "Barber styling a client's hair after a treatment" },
  chair: { src: "/images/services/massage-chair.jpg", alt: "Relaxation lounge with reclining chairs" },
};

/** One category's photo, sized to fill its container (a `.svc-top` or `.cat-card .ic`). */
export function ServiceArt({ cat }: { cat: CategoryId }) {
  const photo = CATEGORY_PHOTO[cat];
  return <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, 300px" style={{ objectFit: "cover" }} />;
}
