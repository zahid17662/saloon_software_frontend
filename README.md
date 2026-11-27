# Web app (`Client` workspace)

Next.js 16 (App Router, React 19, Tailwind v4), deployed on **Vercel**. It holds **no database code and no business logic**: every POS read and write goes to the API in `../Server`, from the server side only.

```
browser  ->  Next.js on Vercel (Server Actions, server components)  ->  API on Render  ->  Neon
```

`src/lib/api.ts` is the single door to the API: it sends the visitor's cookies and IP, authenticated with `API_KEY`. The browser never sees `API_KEY`.

## Layout

| Path | What |
|---|---|
| `src/app/(site)/` | public website at `/` (own root layout, `lang="en"`, static, never calls the API). `SITE_URL` (Vercel env var) sets the canonical and sitemap address |
| `src/site/` | website components and styles. `config.ts`: contact details and reviews. `services.ts`: price list |
| `src/app/(pos)/` | staff screens (own root layout, `lang="bn"`, never indexed): `/pos`, `/barber...`, `/receipt...`, `/admin...` |
| `src/app/actions/` | thin Server Actions that forward to the API |
| `src/components/` | POS UI (`ui.tsx` is the shared kit: reuse it) |
| `src/proxy.ts` | convenience redirects (the API does the real auth check) |
| `src/shared/lib/` | **generated copies** of `Server/src/lib` helpers. Never edit; run `npm run sync:shared` at the root |

## Run and deploy

Run commands from the repository root (see the root README). Local environment: copy `.env.example` to `.env.local`; `API_KEY` and `SESSION_SECRET` must equal the API's values.

Deployment (Vercel, Root Directory `Client`): see [`../docs/DEPLOY.md`](../docs/DEPLOY.md).
