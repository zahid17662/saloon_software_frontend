"use client";

import { SITE } from "./config";
import { SiteIcon } from "./icons";

export function ContactContent() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">Contact</span>
          <h1>Visit Or <b>Reach Us</b></h1>
          <p>Walk-ins are welcome, or book online first to skip the wait.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="visit">
            {SITE.address && (
              <div className="visit-item"><span className="ic"><SiteIcon name="pin" /></span><span><small>Visit us</small><strong>{SITE.address}</strong></span></div>
            )}
            {SITE.phone && (
              <a href={`tel:${SITE.phone}`} className="visit-item"><span className="ic"><SiteIcon name="phone" /></span><span><small>Call us</small><strong>{SITE.phone}</strong></span></a>
            )}
            {SITE.hours && (
              <div className="visit-item"><span className="ic"><SiteIcon name="clock" /></span><span><small>Opening hours</small><strong>{SITE.hours}</strong></span></div>
            )}
            {!SITE.address && !SITE.phone && !SITE.hours && (
              <div className="visit-item"><span className="ic"><SiteIcon name="scissors" /></span><span><small>Visit us</small><strong>{SITE.name}</strong></span></div>
            )}
          </div>
        </div>
      </section>

      <section className="soft">
        <div className="wrap">
          <div className="sec-head"><h2>Frequently Asked <b>Questions</b></h2></div>
          <div className="faq-list">
            {SITE.hours && <details><summary>What are your opening hours?</summary><p>{SITE.hours}</p></details>}
            <details open><summary>Do I need to book in advance?</summary><p>Walk-ins are welcome. Booking online first shows you the price and reserves your time.</p></details>
            <details><summary>Is hair colour priced per step?</summary><p>Hair Highlight Colour is ৳200 per step. Black, Brown and Beige colours are a fixed ৳600.</p></details>
            <details><summary>Are your tools sanitised?</summary><p>Yes. Tools are cleaned after every client, and we use fresh towels and blades.</p></details>
          </div>
        </div>
      </section>
    </>
  );
}
