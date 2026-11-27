"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "./config";
import { SiteIcon } from "./icons";

const HERO = [
  {
    eyebrow: "Gents Parlour",
    title: <>Professional <b>Grooming</b><br />for the Modern Man</>,
    lead: "Sharp haircuts, clean beard trims, facials and hair treatments — done by skilled barbers in a clean, relaxed space.",
  },
  {
    eyebrow: "Facial & Treatment",
    title: <>Fresh Skin,<br /><b>Strong Hair</b></>,
    lead: "From Gold & Diamond facials to Hydra Facial, Hair Spa and Rebonding — premium care made for men.",
  },
  {
    eyebrow: "Body Massage Chair",
    title: <>Relax, <b>Recharge</b><br />&amp; Walk Out Sharp</>,
    lead: "Unwind in our massage chair from just ৳100 for 10 minutes — the perfect finish after a cut.",
  },
];

const WHY = [
  { icon: "clock", title: "Quick & Easy Booking", text: "Pick a service, a time and (if you like) a barber — all online." },
  { icon: "crown", title: "Premium at Fair Prices", text: "Skilled barbers and quality products, with clear prices starting at just ৳50." },
  { icon: "shield", title: "Clean & Hygienic", text: "Sanitised tools, fresh towels and a neat, comfortable space for every client." },
] as const;

const STEPS = [
  ["Pick a Service", "Browse the price list and choose what you need."],
  ["Pick a Time", "Choose your date and time; picking a barber is optional."],
  ["We Confirm", "We call you shortly to confirm your appointment."],
  ["Walk Out Sharp", "Relax and leave looking your best."],
];

export function HomeContent() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false); // the hero stops moving while it is hovered or has keyboard focus

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setSlide((s) => (s + 1) % HERO.length), 5000);
    return () => clearTimeout(t);
  }, [slide, paused]);

  return (
    <>
      <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className="wrap">
          <div>
            {HERO.map((h, i) => (
              <div key={h.eyebrow} className={i === slide ? "slide active" : "slide"} aria-hidden={i !== slide} inert={i !== slide}>
                <span className="eyebrow">{h.eyebrow}</span>
                {i === 0 ? <h1>{h.title}</h1> : <h2 className="h1">{h.title}</h2>}
                <div className="rule" />
                <p className="lead">{h.lead}</p>
                <div className="row">
                  <Link href="/book" className="btn btn-primary">Book Now</Link>
                  <Link href="/services" className="btn btn-outline">See Prices</Link>
                </div>
              </div>
            ))}
            <div className="dots">
              {HERO.map((h, i) => (
                <button key={h.eyebrow} type="button" className={i === slide ? "active" : ""} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
          </div>

          <div className="hero-art">
            <Image src="/images/hero.jpg" alt={`Barber styling a client's hair at ${SITE.name}`} fill preload sizes="(max-width: 900px) 100vw, 460px" />
            <div className="float f1">
              <span className="ic"><SiteIcon name="scissors" size={20} /></span>
              <span><small>Hair Cutting</small><strong>Only ৳150</strong></span>
            </div>
            <div className="float f2">
              <span className="ic"><SiteIcon name="shield" size={20} /></span>
              <span><small>Clean tools</small><strong>Hygiene first</strong></span>
            </div>
          </div>
        </div>
      </section>

      <section className="soft">
        <div className="wrap">
          <div className="sec-head">
            <h2>The <b>Smart</b> Way to Groom</h2>
            <p>Everything a gentleman needs, under one roof.</p>
          </div>
          <div className="grid-3">
            {WHY.map((w) => (
              <div key={w.title} className="why-card">
                <div className="ic"><SiteIcon name={w.icon} size={30} /></div>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <div className="sec-head"><h2>How It <b>Works</b></h2></div>
          <ol className="steps">
            {STEPS.map(([title, text], i) => (
              <li key={title}><div className="num">{i + 1}</div><h3>{title}</h3><p>{text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {SITE.reviews.length > 0 && (
        <section className="soft" id="reviews">
          <div className="wrap">
            <div className="sec-head"><h2>What Our <b>Customers</b> Say</h2></div>
            <div className="grid-3">
              {SITE.reviews.map((r) => (
                <figure key={r.name + r.text} className="rev">
                  <blockquote>{r.text}</blockquote>
                  <figcaption><strong>{r.name}</strong><span>{r.service}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cta-band">
        <Image src="/images/hero.jpg" alt="" fill sizes="100vw" quality={50} />
        <div className="wrap">
          <span className="eyebrow">Ready for a fresh look?</span>
          <h2>Book Your Seat at<br /><b>Nir Smart</b> Today</h2>
          <p>Choose your service and see the price before you visit.</p>
          <Link href="/book" className="btn btn-gold">Book Appointment</Link>
        </div>
      </section>
    </>
  );
}
