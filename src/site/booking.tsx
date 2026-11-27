"use client";

// The public booking flow, as its own page (/book): pick a service -> pick a time (barber
// optional) -> confirm. Unlike the rest of the site this calls the real backend (a public,
// rate-limited API action) and creates a real row the admin screen can see — a deliberate extra
// beyond the v1 PRD's "no online booking" non-goal, added for the website.

import { useEffect, useRef, useState } from "react";
import { createAppointment, listActiveBarbers } from "@/app/actions/appointments";
import { CATEGORIES, SERVICES, taka, type CategoryId } from "./services";
import { ServiceArt } from "./illustrations";
import { CATEGORY_ICON, SiteIcon } from "./icons";
import { formatHHMM, parseTimeInput } from "./time-input";

/** Today's date in Asia/Dhaka (UTC+6, no DST), as "YYYY-MM-DD" — just the date picker's `min`. */
function dhakaTodayKey(): string {
  return new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export interface BookingService {
  name: string;
  price: number;
}

type Step = "pick" | "schedule" | "done";
type Filter = "popular" | "all" | CategoryId;

function newKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `bk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/** `initial` preselects a service (e.g. arriving from a service card's "Book" link via ?name=&price=). */
export function BookingFlow({ initial }: { initial: BookingService | null }) {
  const [step, setStep] = useState<Step>(initial ? "schedule" : "pick");
  const [filter, setFilter] = useState<Filter>("popular");
  const [chosen, setChosen] = useState<BookingService | null>(initial);
  const [barbers, setBarbers] = useState<{ id: number; name: string }[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeText, setTimeText] = useState("");
  const [barberId, setBarberId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const keyRef = useRef(newKey());

  useEffect(() => {
    listActiveBarbers()
      .then(setBarbers)
      .catch(() => setBarbers([]));
  }, []);

  function pick(service: BookingService) {
    setChosen(service);
    setStep("schedule");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !chosen) return;
    if (!date) return setError("Please choose a date");
    const time = parseTimeInput(timeText);
    if (!time) return setError("Please enter a time, e.g. 2:00 PM, 2pm, or 12–1 PM");
    setBusy(true);
    setError("");
    try {
      const r = await createAppointment({
        serviceName: chosen.name,
        barberId: barberId ? Number(barberId) : null,
        customerName: name,
        customerPhone: phone,
        date,
        time,
        preferredTimeText: timeText.trim() || null,
        note,
        idempotencyKey: keyRef.current,
      });
      if (!r.ok) return setError(r.error);
      setStep("done");
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const shown = SERVICES.filter((s) => (filter === "all" ? true : filter === "popular" ? s.popular : s.cat === filter));
  const title = step === "pick" ? "Choose a Service" : step === "schedule" ? "Book Your Appointment" : "Booked!";

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">Book Online</span>
          <h1>{title.split(" ").map((w, i) => (i === title.split(" ").length - 1 ? <b key={i}>{w}</b> : `${w} `))}</h1>
          <p>
            {step === "pick" && "Pick a service to start — you'll choose your time next."}
            {step === "schedule" && "Pick a time; choosing a barber is optional."}
            {step === "done" && "We've got your request."}
          </p>
        </div>
      </section>

      {step === "pick" && (
        <section>
          <div className="wrap">
            <div className="bk-cats">
              {(["popular", "all", ...CATEGORIES.map((c) => c.id)] as Filter[]).map((f) => (
                <button key={f} type="button" className={filter === f ? "bk-chip active" : "bk-chip"} onClick={() => setFilter(f)}>
                  {f === "popular" ? "Popular" : f === "all" ? "All" : CATEGORIES.find((c) => c.id === f)!.name}
                </button>
              ))}
            </div>
            <div className="svc-grid">
              {shown.map((s) => (
                <article key={s.id} className="svc">
                  <div className="svc-top">
                    {s.tag && <span className="tag">{s.tag}</span>}
                    <ServiceArt cat={s.cat} />
                  </div>
                  <div className="svc-body">
                    <span className="svc-cat"><span className="svc-cat-ic"><SiteIcon name={CATEGORY_ICON[s.cat]} size={14} /></span>{CATEGORIES.find((c) => c.id === s.cat)!.name}</span>
                    <h3>{s.name}</h3>
                    <div className="svc-foot">
                      <span className="price">{taka(s.price)}</span>
                      <button type="button" className="add" onClick={() => pick({ name: s.name, price: s.price })} aria-label={`Choose ${s.name}`}>
                        Choose
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === "schedule" && chosen && (
        <section>
          <div className="wrap">
            <div className="book-card">
              <button type="button" className="bk-back" onClick={() => setStep("pick")} aria-label="Choose a different service">
                ← Change service
              </button>
              <form id="booking-form" onSubmit={submit}>
                <div className="bk-summary">
                  <span>{chosen.name}</span>
                  <span className="bk-price">{taka(chosen.price)}</span>
                </div>
                <label className="bk-field">
                  Your Name
                  <input className="bk-input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
                </label>
                <label className="bk-field">
                  Phone Number
                  <input
                    className="bk-input"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                  />
                </label>
                <div className="bk-row2">
                  <label className="bk-field">
                    Date
                    <input className="bk-input" type="date" value={date} min={dhakaTodayKey()} onChange={(e) => setDate(e.target.value)} required />
                  </label>
                  <label className="bk-field">
                    Time
                    <input
                      className="bk-input"
                      type="text"
                      value={timeText}
                      onChange={(e) => setTimeText(e.target.value)}
                      placeholder="e.g. 2 PM, 2:30, or 12–1 PM"
                      required
                    />
                  </label>
                </div>
                {timeText.trim() && (
                  <p className="bk-hint bk-time-preview">
                    {parseTimeInput(timeText)
                      ? `We'll request around ${formatHHMM(parseTimeInput(timeText)!)}.`
                      : "We couldn't quite read that time — try e.g. \"2 PM\" or \"12-1 PM\"."}
                  </p>
                )}
                <label className="bk-field">
                  Preferred Barber <span className="bk-hint">(optional)</span>
                  <select className="bk-input" value={barberId} onChange={(e) => setBarberId(e.target.value)}>
                    <option value="">No preference</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="bk-field">
                  Note <span className="bk-hint">(optional)</span>
                  <textarea className="bk-input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
                </label>
                {error && <p className="bk-error" role="alert">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: "100%" }}>
                  {busy ? "Booking…" : "Confirm Appointment"}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {step === "done" && chosen && (
        <section>
          <div className="wrap">
            <div className="book-card bk-done">
              <div className="ic">✓</div>
              <h3>Thanks, {name}!</h3>
              <p>
                We&apos;ve received your request for <b>{chosen.name}</b> on <b>{date}</b> at <b>{timeText}</b>
                {barberId && barbers.find((b) => String(b.id) === barberId) ? <> with <b>{barbers.find((b) => String(b.id) === barberId)!.name}</b></> : null}.
              </p>
              <p className="bk-hint">We&apos;ll call you at {phone} shortly to confirm.</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
