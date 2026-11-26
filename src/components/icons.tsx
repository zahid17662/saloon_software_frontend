// Small inline icon set (stroke icons, inherit currentColor).
type P = { className?: string };
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const ScissorsIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
  </svg>
);
export const BackIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
export const PrintIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
export const LockIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
export const PlusIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14" />
  </svg>
);
export const ChartIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />
  </svg>
);
export const HomeIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2z" />
  </svg>
);
export const ReceiptIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 2h16v20l-3-2-3 2-2-2-2 2-3-2-3 2zM8 7h8M8 11h8M8 15h5" />
  </svg>
);
export const WalletIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 7H5a2 2 0 010-4h13v4M3 5v14a2 2 0 002 2h15V7" />
    <circle cx="16" cy="14" r="1.5" />
  </svg>
);
export const UsersIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21v-1a6 6 0 0112 0v1M16 4a4 4 0 010 8M22 21v-1a6 6 0 00-4-5.7" />
  </svg>
);
export const ListIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);
export const GearIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
  </svg>
);
export const ArrowUpRightIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);
export const BagIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 7h12l1 13H5zM9 7V5a3 3 0 016 0v2" />
  </svg>
);
export const LogoutIcon =({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
