"use client";

import Link from "next/link";
import { COMBO_IDS, SERVICES, taka } from "./services";

export function OffersContent() {
  const combo = SERVICES.filter((s) => COMBO_IDS.includes(s.id));
  const comboTotal = combo.reduce((sum, s) => sum + s.price, 0);
  const comboName = "Gentleman's Combo (Cut, Wash, Beard & Style)";

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">Offers</span>
          <h1>Save With <b>Combos</b></h1>
          <p>Our best-value package, bookable in one tap.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="combo-box">
            <div>
              <span className="eyebrow">Gentleman&apos;s Combo</span>
              <h2>Cut, Wash, Beard &amp; Style —<br /><b>the full look</b></h2>
              <p>Our everyday package. Book it in one tap.</p>
              <Link href={`/book?name=${encodeURIComponent(comboName)}&price=${comboTotal}`} className="btn btn-gold">
                Book Combo
              </Link>
            </div>
            <ul>
              {combo.map((s) => (
                <li key={s.id}><span>{s.name}</span><span>{taka(s.price)}</span></li>
              ))}
              <li className="total"><span>Total</span><span>{taka(comboTotal)}</span></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
