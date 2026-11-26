"use client";

import { useState } from "react";
import { useCatalog } from "../catalog-context";
import { Button, Card, ErrorText, Field, LoadingScreen, PageTitle, Select } from "../ui";
import { changeAdminPin, changeShopCode } from "@/app/actions/auth";
import { updateSettings } from "@/app/actions/catalog";
import { NET_ERR } from "@server/lib/messages";
import { bnDigits } from "@server/lib/money";
import type { PaperWidth, Settings } from "@server/lib/types";

function Saved({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p role="status" className="text-sm text-success">
      সেভ হয়েছে ✓
    </p>
  );
}

export function SettingsPage() {
  const catalog = useCatalog();
  if (!catalog) return <LoadingScreen />;
  return (
    <>
      <PageTitle title="সেটিংস" />
      <div className="grid gap-4 lg:grid-cols-2">
        <ShopInfo settings={catalog.settings} />
        <div className="space-y-4">
          <PinForm />
          <ShopCodeForm />
          <DataTools />
        </div>
      </div>
    </>
  );
}

function ShopInfo({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({
    shopName: settings.shopName,
    shopAddress: settings.shopAddress,
    shopPhone: settings.shopPhone,
    receiptFooter: settings.receiptFooter,
    paperWidth: settings.paperWidth,
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setSaved(false);
  };

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-fg">দোকান ও রসিদ</h2>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setSaved(false);
          try {
            const r = await updateSettings(form);
            if (!r.ok) return setError(r.error);
            setError("");
            setSaved(true);
          } catch {
            setError(NET_ERR);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="দোকানের নাম" value={form.shopName} onChange={set("shopName")} required />
        <Field label="ঠিকানা" value={form.shopAddress} onChange={set("shopAddress")} />
        <Field label="ফোন" inputMode="tel" value={form.shopPhone} onChange={set("shopPhone")} />
        <Field label="রসিদের নিচের লেখা" value={form.receiptFooter} onChange={set("receiptFooter")} />
        <Select label="রসিদের কাগজ" value={form.paperWidth} onChange={set("paperWidth")}>
          {(["58", "80", "A4"] as PaperWidth[]).map((p) => (
            <option key={p} value={p}>
              {p === "A4" ? "A4" : `${bnDigits(p)} মিমি থার্মাল`}
            </option>
          ))}
        </Select>
        <ErrorText>{error}</ErrorText>
        <Saved show={saved} />
        <Button type="submit" disabled={busy}>
          {busy ? "সেভ হচ্ছে…" : "সেভ করুন"}
        </Button>
      </form>
    </Card>
  );
}

function PinForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-fg">এডমিন পিন পরিবর্তন</h2>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaved(false);
          if (next !== confirm) return setError("নতুন পিন দুইবার একই হয়নি");
          const r = await changeAdminPin({ current, next });
          if (!r.ok) return setError(r.error);
          setError("");
          setSaved(true);
          setCurrent("");
          setNext("");
          setConfirm("");
        }}
      >
        <Field label="বর্তমান পিন" type="password" inputMode="numeric" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="নতুন পিন" type="password" inputMode="numeric" value={next} onChange={(e) => setNext(e.target.value)} required />
          <Field label="আবার লিখুন" type="password" inputMode="numeric" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <ErrorText>{error}</ErrorText>
        <Saved show={saved} />
        <Button type="submit" variant="secondary">
          পিন বদলান
        </Button>
      </form>
    </Card>
  );
}

function ShopCodeForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold text-fg">দোকানের কোড পরিবর্তন</h2>
      <p className="mb-4 text-sm text-muted">কোড বদলালে দোকানের সব ফোন/কম্পিউটারে আবার নতুন কোড দিতে হবে।</p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaved(false);
          if (!window.confirm("সব ডিভাইস থেকে লগআউট হবে। কোড বদলাবেন?")) return;
          const r = await changeShopCode({ next: code });
          if (!r.ok) return setError(r.error);
          setError("");
          setSaved(true);
          setCode("");
        }}
      >
        <Field label="নতুন কোড (৪–৮ সংখ্যা)" type="password" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} required />
        <ErrorText>{error}</ErrorText>
        <Saved show={saved} />
        <Button type="submit" variant="secondary">
          কোড বদলান
        </Button>
      </form>
    </Card>
  );
}

// A plain file download from the admin-only route (the browser keeps the current page).
function downloadBackup() {
  const a = document.createElement("a");
  a.href = "/admin/backup";
  a.download = "";
  a.click();
}

function DataTools() {
  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold text-fg">ডেটা</h2>
      <p className="mb-4 text-sm text-muted">সব হিসাবের একটি কপি ডাউনলোড করে রাখুন।</p>
      <Button variant="secondary" onClick={downloadBackup}>
        ব্যাকআপ ডাউনলোড
      </Button>
    </Card>
  );
}
