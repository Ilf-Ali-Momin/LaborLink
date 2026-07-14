# LaborLink

The compliant marketplace for student work in Germany. Marketing landing page plus a full app preview (job feed, proposals, contracts, messages, alerts, profile, employer hiring and candidates), built from `DESIGN.md` (design source of truth) and the LaborLink Figma flows, audited against `SECURITY.md`.

## Stack

React 19 + Vite + TypeScript, Tailwind CSS v3, react-router-dom, framer-motion, lucide-react. Fonts (Inter Variable + Instrument Serif italic) are self hosted via Fontsource — no Google Fonts CDN, which keeps the page GDPR clean for the German market.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production bundle
npm run lint     # oxlint
```

## Routes

| Route | What it is |
|---|---|
| `/` | Marketing landing page |
| `/login`, `/onboarding` | Demo sign in (no password, local only) + role pick |
| `/app/jobs`, `/app/jobs/:id`, `/app/jobs/:id/propose`, `/app/bravo` | Student: feed → detail → proposal → success |
| `/app/proposals`, `/app/contracts` | Student: applications and contracts with hour tracking |
| `/app/hiring`, `/app/candidates` | Employer: post roles (minimum wage validated), browse verified students |
| `/app/messages`, `/app/alerts`, `/app/profile` | Shared: chat, notifications, profile with GDPR export/delete |
| `/impressum`, `/datenschutz`, `/agb` | Legal placeholder pages |

The `/app` area needs a session and adapts its tab bar to the chosen role.

## Two modes: demo and live

The app runs in **demo mode** (localStorage, no password, no server) until Supabase credentials exist, then switches to **live mode** automatically — real accounts, real database, Row Level Security. The switch is `src/lib/supabase.ts`; nothing else needs touching.

## Backend setup (Supabase) — where to put what

1. Create a project at supabase.com. **Pick an EU region (e.g. Frankfurt)** — LaborLink handles personal data under GDPR.
2. In the Supabase Dashboard open **SQL Editor** and run, in this order:
   - the whole of [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) (tables, RLS policies, triggers, RPCs)
   - the whole of [`supabase/seed.sql`](supabase/seed.sql) (8 demo job listings)
3. In **Settings → API**, copy two values: the **Project URL** and the **anon public** key.
4. In the repo root, create a file named **`.env.local`** (copy `.env.example`) with:
   ```
   VITE_SUPABASE_URL=your project url
   VITE_SUPABASE_ANON_KEY=your anon public key
   ```
5. Restart `npm run dev`. The Demo badge disappears and login becomes real (email + password via Supabase Auth, sign up + sign in).
6. Optional, for quick testing: in **Authentication → Sign In / Up → Email**, disable "Confirm email" so new accounts skip the confirmation mail. Re-enable it before anything public.

Never use the **service_role** key anywhere in this repo — it bypasses RLS. The anon key is the only one the frontend may see.

### What live mode does

- Supabase Auth accounts (provider managed passwords, reset, rate limits); a `profiles` row is created by trigger on signup
- Jobs come from the `jobs` table (seeded + employer posted; employer posts are marked "Verification pending" until the platform flips `verified` — clients cannot, a trigger blocks it)
- Proposals, applicant review (accept/decline), employer↔student chat (created via the `start_conversation` RPC only between people who share a proposal), and alerts generated **server side by database triggers**
- Minimum wage is enforced by a database CHECK constraint, not just the form
- GDPR: profile "Export my data" pulls everything from the database; "Delete my data" calls the `delete_my_data()` RPC
- Contracts and the profile earnings/hours tiles remain illustrative until payroll exists

## Where to change things

| What | Where |
|---|---|
| Landing page text (EN or DE) | `src/content.ts` — one typed object, keyed `en` / `de` |
| App screen text (EN or DE) | `src/content-app.ts` — same pattern, exposed as `ta` on `useI18n()` |
| Demo data (jobs, chats, alerts, candidates) | `src/data/*.ts` |
| Colors, dark theme | CSS variables in `src/index.css` (`:root` = light, `.dark` = dark) |
| Radius, shadows, fonts, container width | `tailwind.config.js` |
| Routes and guards | `src/App.tsx` |
| Landing section order | `src/pages/Landing.tsx` |
| One landing section | Its file in `src/components/` (one component per section) |
| One app screen | Its file in `src/pages/app/` |
| App chrome (tab bar, top bar) | `src/components/app/AppShell.tsx` |
| Scroll/hover motion | `src/components/ui/Reveal.tsx` (respects `prefers-reduced-motion`) |
| Language / theme / session | `src/lib/i18n.tsx`, `src/lib/theme.tsx`, `src/lib/auth.tsx` |

## Project rules

- No hyphens anywhere in visible copy.
- Success green (`--c-success`) appears only on compliance and trust cues.
- Exactly one italic serif accent word in the H1.
- All strings bilingual ready; layouts leave room for longer German words.

## Before production deploy

- Complete Impressum, Datenschutzerklärung and AGB with real company details (current pages are labeled placeholders).
- Fill the placeholder Company footer links (About, Careers, Press, Contact) or remove them.
- Serve over HTTPS only, with SPA fallback routing (all paths → index.html).
- Replace the demo session with a managed auth provider and follow `SECURITY.md` section 1 (RLS on every table) and section 2 (secrets only in env vars; only `VITE_` prefixed public values reach the client).
