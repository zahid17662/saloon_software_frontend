import type { ReactNode } from "react";
import type { CategoryId } from "./services";

function Icon({ size = 24, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const PATHS = {
  scissors: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" /></>,
  drop: <><path d="M12 2.7S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.3-7-12.3z" /><path d="M9 15a3 3 0 0 0 3 3" /></>,
  face: <><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2M9 9.5h.01M15 9.5h.01" /></>,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />,
  chair: <><path d="M7 4h7a2 2 0 0 1 2 2v6H7z" /><path d="M5 12h14v3H5zM8 15v5M16 15v5M6 20h12" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  crown: <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  bag: <><path d="M6 7h12l1 13H5z" /><path d="M9 7a3 3 0 0 1 6 0" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

export type IconName = keyof typeof PATHS;

export function SiteIcon({ name, size }: { name: IconName; size?: number }) {
  return <Icon size={size}>{PATHS[name]}</Icon>;
}

export const CATEGORY_ICON: Record<CategoryId, IconName> = {
  hair: "scissors",
  color: "drop",
  facial: "face",
  treat: "spark",
  chair: "chair",
};

/** House + person in an arc, from the shop signboard. */
export function Logo() {
  return (
    <svg viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 30 32 14l18 16" strokeWidth="4.5" />
      <path d="M42 21v-7h5v11.5" strokeWidth="4" />
      <rect x="28" y="20" width="8" height="8" rx="1" fill="currentColor" stroke="none" />
      <circle cx="32" cy="36" r="3.4" fill="currentColor" stroke="none" />
      <path d="M10 34c0 13 10 22 22 22s22-9 22-22" strokeWidth="5" />
      <path d="M17 36c1 9 7.5 14 15 14s14-5 15-14" strokeWidth="3.5" />
      <path d="M24 42c2.5 2.6 5 3.6 8 3.6s5.5-1 8-3.6" stroke="#b98552" strokeWidth="3" />
    </svg>
  );
}
