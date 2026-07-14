# LaborLink — Design Spec (Landing Page v1)

A two sided marketplace for the German flexible student labor market, with a compliance layer at its core (Werkstudent and Minijob rules, GDPR, payroll ready). This document is the single source of truth for the landing page build.

No hyphens anywhere in copy.

---

## 1. Positioning and Tone

**One line:** The compliant way for students in Germany to find flexible work, and for employers to hire them without the legal headache.

**Feeling:** Trustworthy, modern, calm. Soft blue tech aesthetic (glass cards, gradients) but grounded enough that an HR manager trusts us with payroll and legal responsibility. Think "fintech meets student energy," not "AI toy."

**Two audiences, one page:**
- Students: want fast, flexible, legit work near them.
- Employers: want vetted student workers, hours tracking, and automatic compliance.

Trust and legitimacy are the product moat, so they must be visible design elements, not fine print.

---

## 2. Brand and Visual Direction

Direction chosen: **Trust forward** (soft blue base, cleaner and more grounded than a pure Larka clone).

### Color tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F9FC` | Page background |
| `--bg-gradient` | `radial-gradient(circle at 70% 20%, #DCE7FF 0%, #F7F9FC 55%)` | Hero and section washes |
| `--surface` | `#FFFFFF` | Cards |
| `--surface-glass` | `rgba(255,255,255,0.65)` + `backdrop-filter: blur(16px)` | Glass cards, nav pill |
| `--primary` | `#2563EB` | Primary buttons, accents, links |
| `--primary-deep` | `#1E40AF` | Hover, gradient end |
| `--primary-soft` | `#EAF1FF` | Chips, icon backgrounds |
| `--ink` | `#0F172A` | Headings, body |
| `--ink-muted` | `#64748B` | Secondary text |
| `--border` | `rgba(15,23,42,0.08)` | Card borders, dividers |
| `--success` | `#16A34A` | Compliance checkmarks, "verified" states |

Success green appears **only** on trust and compliance cues (verified badge, compliant checkmark). Everything else stays in the blue and ink range.

### Typography

- Headings: a clean geometric sans (Inter, or Satoshi if available). Weights 600 to 700.
- One **italic serif accent** on a single hero word (matches your Larka taste). Use a serif like Instrument Serif or Fraunces, italic. Only one accent word, not more.
- Body: same sans as headings, 400 to 500, `--ink-muted` for secondary.
- Scale (desktop): H1 64px / H2 40px / H3 22px / body 16 to 18px / caption 13px. Line height 1.1 for headings, 1.6 for body.

### Shape and depth

- Radius: cards 20px, buttons and inputs 12px, pills 999px.
- Shadow: `0 8px 30px rgba(37,99,235,0.08)` soft and blue tinted. No harsh grey drop shadows.
- Borders are subtle (`--border`). Glass cards get a 1px inner light border.

### Motion (purposeful only)

- Fade and rise on scroll for section entries (16px translate, 400ms).
- Hover: cards lift 2px, shadow deepens slightly.
- The hero search bar and the compliance dashboard mock can have a subtle micro interaction (a checkmark that animates in). No decorative motion.
- Respect `prefers-reduced-motion`.

---

## 3. Layout and Sections (top to bottom)

Max content width 1200px, generous vertical padding (96 to 128px between sections). Mobile first: single column, search collapses, split hero stacks.

### 3.1 Nav (sticky glass pill)
- Left: `LaborLink` wordmark (lowercase, medium weight).
- Center: Home, For Students, For Employers, Pricing.
- Right: DE / EN toggle, light/dark toggle, "Sign in" ghost button, "Get started" primary button.
- Sits inside a floating rounded glass pill with blur, like the Larka reference.

### 3.2 Hero (split, search below)
- Small pill label above headline: "Compliant student work in Germany".
- H1 with one italic serif accent word. Example:
  "Flexible work, done *properly*." (accent on "properly")
  Subhead: one sentence on compliant, fast, near you.
- **Split call to action:** two large cards or a segmented toggle:
  - "I am looking for work" (student) primary blue.
  - "I am hiring students" (employer) outline.
- **Search bar** directly beneath, Airbnb style, with fields: role or keyword, location (city), job type (Minijob / Werkstudent / one off). Big round search button.
- Soft blue gradient blobs in the background, low opacity, blurred.

### 3.3 Trust strip
- "Trusted by X student jobs filled" or a row of partner logos (placeholder LOGO marks).
- A compact row of trust chips with success green ticks: "Minijob compliant", "Werkstudent rules built in", "GDPR safe", "Payroll ready".

### 3.4 How it works (3 steps)
- Three glass cards, numbered: Search and match, Verify and comply, Work and get paid.
- Each with an icon in a `--primary-soft` rounded square.

### 3.5 Live job cards (marketplace proof)
- A grid of 4 to 6 realistic listing cards: title, employer, city, pay per hour, job type tag, a small "verified employer" green badge.
- This is the Airbnb move: show the actual product, not a manifesto.

### 3.6 Compliance dashboard mock (the moat)
- Large glass panel showing a mock employer view: hours tracked, contract status, "compliant" state with an animated green check, tax and social contribution line items abstracted.
- Left side copy explaining why compliance as a service is the differentiator.
- This section is what makes LaborLink not "just another job board."

### 3.7 For Students / For Employers (two column value props)
- Alternating rows. Students: flexible hours, guaranteed legal pay, work near campus. Employers: vetted talent, automatic compliance, hours and payroll in one place.

### 3.8 Testimonials
- One large featured quote card (student or HR manager) plus two smaller cards. Realistic, specific numbers.

### 3.9 Pricing (transparent, no "contact us" wall)
- Clear tiers. Students free. Employers: a per hire or subscription tier with a visible price. Transparency is a trust signal here, do not hide it.

### 3.10 FAQ (accordion)
- Questions on legality, Minijob vs Werkstudent, how pay works, data handling.

### 3.11 CTA band + Footer
- Full width soft gradient band: "Start hiring compliantly" / "Find your next shift" with the split CTA again.
- Footer: columns (Product, Company, Legal, Language toggle). Include Impressum and Datenschutz links (German legal requirement).

---

## 4. Content and Trust Rules

- Every compliance claim gets a visible cue (green tick or badge), never buried.
- Bilingual ready: build all strings so a DE/EN toggle can swap them. Do not hardcode English into layout widths that break in German (German words are longer, leave room).
- Include Impressum and Datenschutzerklärung in the footer, these are legally expected in Germany.

---

## 5. Responsive

- Breakpoints: mobile < 640, tablet 640 to 1024, desktop > 1024.
- Hero: split cards stack on mobile, search fields stack vertically.
- Job grid: 1 col mobile, 2 col tablet, 3 col desktop.
- Nav collapses to a hamburger with the glass pill preserved.

---

## 6. Accessibility

- Contrast: body text meets WCAG AA on the light background (`--ink` on `--bg`).
- Focus states visible on all interactive elements (2px `--primary` ring).
- All icons paired with text labels, not icon only.
- `prefers-reduced-motion` disables scroll and hover motion.

---

## 7. Tech (suggested)

Matches your stack: React + Vite + Tailwind CSS. Framer Motion for the purposeful animations, lucide-react for icons. Fonts via Google Fonts (Inter + Instrument Serif) or Fontshare (Satoshi + Fraunces).
