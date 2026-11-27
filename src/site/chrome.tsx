"use client";

// Header + footer shared by every public-site page (Home, Services, Offers, Contact, Book), now
// that the site is multi-page rather than one long scrolling page with anchor links.

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "./config";
import { CATEGORIES } from "./services";
import { Logo, SiteIcon } from "./icons";
import "./site.css";

const NAV = [
  ["/services", "Services"],
  ["/offers", "Offers"],
  ["/contact", "Contact"],
] as const;

export function SiteChrome({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const brand = (
    <Link href="/" className="brand">
      <Logo />
      <span className="brand-text">
        <strong>NIR SMART</strong>
        <span>GENTS PARLOUR</span>
      </span>
    </Link>
  );

  return (
    <div className="nir-site" lang="en">
      <a href="#main" className="skip">Skip to content</a>
      <div className="topbar" role="region" aria-label="Welcome">
        <div className="wrap">
          <span>Look Good, <b>Feel Confident</b></span>
          {SITE.hours && <span className="hide-sm">{SITE.hours}</span>}
        </div>
      </div>

      <header className="nav">
        <div className="wrap">
          {brand}
          <nav className={menuOpen ? "menu open" : "menu"} aria-label="Main">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link href="/book" className="btn btn-primary nav-book">Book Now</Link>
            <button type="button" className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
              <SiteIcon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {children}
      </main>

      <footer>
        <div className="wrap">
          <div>
            {brand}
            <p>Look Good, Feel Confident. Premium grooming for men at honest prices.</p>
          </div>
          <div>
            <h2>Services</h2>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/services?cat=${c.id}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Explore</h2>
            <ul>
              <li><Link href="/">Home</Link></li>
              {NAV.map(([href, label]) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
              <li><Link href="/pos" prefetch={false}>Staff login</Link></li>
            </ul>
          </div>
        </div>
        <div className="copy">© {SITE.year} {SITE.name}. All rights reserved.</div>
      </footer>
    </div>
  );
}
