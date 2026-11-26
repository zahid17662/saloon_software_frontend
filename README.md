# Salon POS: web app (frontend)

Next.js 16 (App Router, React 19, Tailwind v4) UI for the salon POS, deployed on **Vercel**. All UI text
is Bangla. It holds **no database code and no business logic**: every read and write goes to the backend
API (`saloon_software_backend`, deployed on Render) from the server side only.

```
browser  ->  Next.js on Vercel (Server Actions, server components)  ->  API on Render  ->  Neon
```

The browser never talks to the API and never sees `API_KEY`. `src/lib/api.ts` is the single door: it sends
the visitor's cookies and IP to the API, authenticated with `API_KEY`, and applies the session cookies the
API answers with. `src/app/actions/*` are thin forwards (plus `revalidatePath` after a write).

## Layout

| Path | What |
|---|---|
| `src/app/` | pages; `actions/` = Server Actions that forward to the API |
| `src/components/` | UI (`ui.tsx` is the shared kit: reuse it) |
| `src/lib/api.ts` | the only code that knows `API_URL` / `API_KEY` |
| `src/proxy.ts` | convenience redirects when there is no session cookie (the API does the real check) |
| `src/shared/lib/` | **generated copies** of the backend's money, time, report and type helpers, so the UI formats numbers the same way. Do not edit; change them in the backend repo and re-sync |

## Run locally

```bash
cp .env.example .env.local   # API_URL (e.g. http://localhost:4000), API_KEY, SESSION_SECRET
npm install
npm run dev                  # http://localhost:3000, with the API running next to it
npm run typecheck && npm run lint && npm test && npm run build
```

`API_KEY` and `SESSION_SECRET` must equal the values the API runs with.

## Deploy on Vercel

1. **Add New, Project**, import this repo (framework: Next.js, detected). `vercel.json` pins region `sin1`.
2. Environment variables (Production, and a separate set for Preview if you use previews):

| Name | Value |
|---|---|
| `API_URL` | the Render service URL, e.g. `https://salon-api.onrender.com` (no trailing slash) |
| `API_KEY` | the **same** secret as on Render (at least 32 characters) |
| `SESSION_SECRET` | the **same** secret as on Render |

3. Deploy. No database variables are needed here, and none should ever be added.

On Vercel the visitor's IP header is trusted, so the API's login rate limit works per client.
