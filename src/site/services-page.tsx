"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORY_ICON, SiteIcon } from "./icons";
import { ServiceArt } from "./illustrations";
import { CATEGORIES, SERVICES, taka, type CategoryId } from "./services";

type Filter = "popular" | "all" | CategoryId;

const isCategoryId = (v: string | null): v is CategoryId => CATEGORIES.some((c) => c.id === v);
const category = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export function ServicesContent() {
  const params = useSearchParams();
  const fromQuery = params.get("cat");
  const [filter, setFilter] = useState<Filter>(isCategoryId(fromQuery) ? fromQuery : "popular");

  const shown = SERVICES.filter((s) => (filter === "all" ? true : filter === "popular" ? s.popular : s.cat === filter));

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">Price List</span>
          <h1>Our <b>Services</b></h1>
          <p>Pick a category to see its prices, then book the one you want.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cat-grid">
            {CATEGORIES.map((c) => {
              const list = SERVICES.filter((s) => s.cat === c.id);
              return (
                <button key={c.id} type="button" className={filter === c.id ? "cat-card active" : "cat-card"} onClick={() => setFilter(c.id)}>
                  <span className="ic"><ServiceArt cat={c.id} /></span>
                  <span className="title">{c.name}</span>
                  <span className="blurb">{c.blurb}</span>
                  <span className="from">{list.length} services · from {taka(Math.min(...list.map((s) => s.price)))}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="soft">
        <div className="wrap">
          <div className="sec-head">
            <h2>
              {filter === "popular" ? <>Popular <b>Services</b></> : filter === "all" ? <>All <b>Services</b></> : <b>{category(filter).name}</b>}
            </h2>
            <p>Tap Book to pick a time for any service.</p>
          </div>
          <div className="svc-grid">
            {shown.map((s) => (
              <article key={s.id} className="svc">
                <div className="svc-top">
                  {s.tag && <span className="tag">{s.tag}</span>}
                  <ServiceArt cat={s.cat} />
                </div>
                <div className="svc-body">
                  <span className="svc-cat"><span className="svc-cat-ic"><SiteIcon name={CATEGORY_ICON[s.cat]} size={14} /></span>{category(s.cat).name}</span>
                  <h3>{s.name}</h3>
                  <div className="svc-foot">
                    <span className="price">{taka(s.price)}</span>
                    <Link href={`/book?name=${encodeURIComponent(s.name)}&price=${s.price}`} className="add" aria-label={`Book ${s.name}`}>
                      Book
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="center">
            <button type="button" className="btn btn-primary" onClick={() => setFilter(filter === "all" ? "popular" : "all")}>
              {filter === "all" ? "Show Popular" : "View All Services"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
