"use client";

import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

import { bnDigits } from "@server/lib/money";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover font-semibold shadow-[0_4px_14px_rgb(59_130_246/0.28)]",
  secondary: "bg-surface text-fg border border-line hover:bg-surface-2",
  danger: "bg-danger-soft text-danger hover:bg-danger/15",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
};
const SIZES: Record<Size, string> = {
  sm: "h-9 pointer-coarse:h-11 px-3.5 text-sm rounded-full",
  md: "h-11 px-5 text-[15px] rounded-full",
  lg: "h-14 px-7 text-lg rounded-full",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

/** Round icon button, like the ↗ and filter buttons on dashboard cards. */
export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "inline-flex h-10 w-10 pointer-coarse:h-11 pointer-coarse:w-11 items-center justify-center rounded-full border border-line bg-surface text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-3xl bg-surface p-4 shadow-card sm:p-5", className)}>{children}</div>;
}

export function CardHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-fg">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[15px] text-fg placeholder:text-subtle transition-colors focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 focus:outline-none";

export function Field({
  label,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <label htmlFor={id} className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <input id={id} className={inputCls} aria-describedby={hint ? hintId : undefined} {...props} />
      {hint && (
        <span id={hintId} className="mt-1 block text-xs text-subtle">
          {hint}
        </span>
      )}
    </label>
  );
}

export function Select({
  label,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <select id={id} className={inputCls} {...props}>
        {children}
      </select>
    </label>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "gold" | "red" | "green"; children: ReactNode }) {
  const tones = {
    neutral: "bg-surface-2 text-muted",
    gold: "bg-primary-soft text-primary",
    red: "bg-danger-soft text-danger",
    green: "bg-success-soft text-success",
  };
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap", tones[tone])}>
      {children}
    </span>
  );
}

/** Green/red pill with an arrow, e.g. "+8.2% ↗". */
export function TrendPill({ value, onDark }: { value: number | null; onDark?: boolean }) {
  if (value === null) return null;
  const up = value >= 0;
  const text = bnDigits(`${up ? "+" : ""}${value.toFixed(1)}%`);
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        onDark ? "bg-white/20 text-white" : up ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
      )}
    >
      {text}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        {up ? <path d="M7 17L17 7M9 7h8v8" /> : <path d="M7 7l10 10M17 9v8H9" />}
      </svg>
    </span>
  );
}

export type StatTone = "primary" | "lavender" | "blush" | "peach" | "mint" | "plain";
const STAT_TONES: Record<StatTone, string> = {
  primary: "bg-primary text-white shadow-[0_10px_30px_rgb(59_130_246/0.30)]",
  lavender: "bg-lavender",
  blush: "bg-blush",
  peach: "bg-peach",
  mint: "bg-mint",
  plain: "bg-surface shadow-card",
};

export function Stat({
  label,
  value,
  sub,
  tone = "plain",
  icon,
  trend = null,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: StatTone;
  icon?: ReactNode;
  trend?: number | null;
}) {
  const dark = tone === "primary";
  return (
    <div className={cx("flex min-h-36 flex-col rounded-3xl p-5", STAT_TONES[tone])}>
      <div className="flex items-start justify-between gap-2">
        <span className={cx("text-[15px] font-medium", dark ? "text-white/90" : "text-fg")}>{label}</span>
        {icon && (
          <span
            className={cx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              dark ? "bg-white/20 text-white" : "bg-surface/70 text-fg",
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
        <span className={cx("text-[28px] leading-none font-bold tabular-nums", dark ? "text-white" : "text-fg")}>{value}</span>
        <TrendPill value={trend} onDark={dark} />
      </div>
      {sub && <p className={cx("mt-2 text-xs", dark ? "text-white/80" : "text-muted")}>{sub}</p>}
    </div>
  );
}

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-dashed border-line-strong bg-surface/60 p-8 text-center text-subtle">{children}</div>;
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-primary" role="status" aria-label="লোড হচ্ছে" />
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
      {children}
    </p>
  );
}

const FOCUSABLE = "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex=\"-1\"])";

/**
 * Accessible modal dialog: labelled by its heading, moves focus inside on open, keeps Tab inside,
 * closes on Escape, and returns focus to the control that opened it. Set `dismissible={false}`
 * while a save is in flight so Escape/backdrop/X cannot discard it.
 */
export function Modal({
  open,
  title,
  onClose,
  children,
  dismissible = true,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  dismissible?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Latest callbacks without re-running the focus effect on every parent render.
  const live = useRef({ onClose, dismissible });
  useEffect(() => {
    live.current = { onClose, dismissible };
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const root = panel.current;
    if (root && !root.contains(document.activeElement)) {
      const first = root.querySelector<HTMLElement>("input,select,textarea") ?? root.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? root).focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (live.current.dismissible) live.current.onClose();
        return;
      }
      if (e.key !== "Tab" || !root) return;
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return e.preventDefault();
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => live.current.dismissible && live.current.onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-pop focus:outline-none sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold text-fg">
            {title}
          </h2>
          <IconButton onClick={onClose} disabled={!dismissible} aria-label="বন্ধ করুন" className="disabled:opacity-40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Toggle switch used for active/inactive. */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 items-center gap-3 text-sm text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className={cx("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-primary" : "bg-line-strong")}>
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-5.5" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}
