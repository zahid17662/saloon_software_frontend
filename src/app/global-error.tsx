"use client";

// Last-resort boundary: replaces the root layout, so it must render <html> and <body> itself and
// cannot rely on the app's CSS variables or fonts.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f3f5f9", color: "#111827" }}>
        <main
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 20 }}>কিছু একটা ভুল হয়েছে</h1>
          <p>অ্যাপটি চালু করা যায়নি। আবার চেষ্টা করুন।</p>
          <button
            onClick={() => retry()}
            style={{ height: 44, padding: "0 20px", borderRadius: 12, border: 0, background: "#3b82f6", color: "#fff", fontWeight: 600 }}
          >
            আবার চেষ্টা করুন
          </button>
        </main>
      </body>
    </html>
  );
}
