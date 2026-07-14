# LaborLink — Security Audit and Enforcement

Use this file two ways: (1) paste it into Cursor as a review pass over generated code, and (2) run through it manually before every commit and before any deploy. LaborLink handles student personal data and payroll under German law and GDPR, so these are not optional.

No hyphens in visible copy anywhere (project wide rule), but code identifiers keep their normal syntax.

Cursor instruction: audit the codebase against every item below. For each item, report PASS, FAIL, or NOT APPLICABLE with the file and line. Fix every FAIL and show the diff. Do not mark anything PASS without pointing to the actual code that satisfies it.

---

## 1. Database and Backend (Supabase / Postgres)

### 1.1 Row Level Security on every table
- [ ] RLS is ENABLED on every table without exception, including join tables and audit tables.
  - Verify: `SELECT relname, relrowsecurity FROM pg_class WHERE relkind = 'r';` every app table shows `relrowsecurity = true`.
- [ ] Every table has explicit policies. RLS enabled with no policy means deny all, which silently breaks features; RLS enabled with a permissive `USING (true)` policy is as bad as no RLS. Neither is acceptable.
- [ ] Policies scope rows to the owner. A student sees only their own applications and profile; an employer sees only their own job posts and the applicants to them. Pattern: `USING (auth.uid() = user_id)`.
- [ ] Separate policies per action (SELECT, INSERT, UPDATE, DELETE). Do not use one blanket `FOR ALL` unless the logic is truly identical.
- [ ] Role separation between student and employer is enforced in policy, not just in the UI. An employer must not be able to read another employer's applicant list.
- [ ] Sensitive tables (payroll, contracts, tax and social contribution records) have stricter policies and are never exposed through a public view.
- [ ] `service_role` key is used ONLY in trusted server side code, never shipped to the client. The client uses the `anon` key, which is subject to RLS.

### 1.2 Server side authorization
- [ ] No permission or role check lives only in the frontend. Admin, employer, and student capability checks are enforced on the backend (RLS policies, Postgres functions with `security definer` used carefully, or an edge function that re checks `auth.uid()`).
- [ ] Business logic that grants access (approve a hire, release a payment, mark compliant) runs server side and re validates the caller. Never trust a client supplied `role`, `isAdmin`, or `userId` field.
- [ ] Any `security definer` function validates the caller explicitly and has a locked `search_path`.

### 1.3 Injection safety
- [ ] All queries are parameterized or use the Supabase query builder. No string concatenation of user input into SQL.
- [ ] Any raw SQL (rpc, edge functions) uses bound parameters, never template literals with user data.

---

## 2. Secrets and Credentials

- [ ] No API keys, passwords, connection strings, JWT secrets, or service_role keys anywhere in source files. Grep the repo: search for `service_role`, `SUPABASE_SERVICE`, `SECRET`, `PASSWORD`, `apikey`, `Bearer `, and any 40+ char base64 looking string.
- [ ] All secrets come from environment variables and, for anything server side, from a secure store (Supabase secrets, Vercel env vars, a vault). Not committed.
- [ ] `.gitignore` includes `.env`, `.env.*` (except `.env.example`), `node_modules`, and any local secret files. Confirm they are NOT already tracked: `git ls-files | grep -E '\.env|node_modules'` returns nothing.
- [ ] A committed `.env.example` documents required variable NAMES only, with empty or dummy values.
- [ ] Frontend bundle contains no backend secrets. Only `VITE_` prefixed public values (the Supabase URL and anon key) reach the client. Confirm the service_role key has no `VITE_` prefix and never appears in client code.
- [ ] If any secret was ever committed in git history, it is rotated (invalidated and reissued), because history is public even after deletion.

---

## 3. Injection, Auth, and Session Handling

### 3.1 Input validation and XSS
- [ ] Every user input field is validated and sanitized on the SERVER, not just the client. Client validation is UX only.
- [ ] Use a schema validator (Zod) on all inputs: search fields, profile data, job posts, messages, file names.
- [ ] No `dangerouslySetInnerHTML` with user content. If unavoidable, sanitize with a maintained library (DOMPurify) first.
- [ ] User supplied URLs, file uploads, and filenames are validated (type, size, extension) before storage.
- [ ] Output encoding: user content rendered as text, never interpreted as HTML or script.

### 3.2 Authentication
- [ ] Auth uses a managed provider (Supabase Auth, OAuth, SSO), not hand rolled login or custom password hashing.
- [ ] Password reset, email verification, and rate limiting on auth endpoints are handled by the provider, not reimplemented.
- [ ] Server side session validation on every protected route. Never infer "logged in" from a client flag.

### 3.3 Session and cookies
- [ ] Auth tokens are stored in `HttpOnly`, `Secure`, `SameSite` cookies where the setup allows, rather than `localStorage`, to reduce token theft via XSS. If using the Supabase client default, document the tradeoff and ensure XSS defenses above are tight.
- [ ] No access or refresh token is ever written to `localStorage`, `sessionStorage`, or a non HttpOnly cookie by app code.
- [ ] CSRF protections in place for any cookie based state changing request.

---

## 4. Dependencies

- [ ] Every package in `package.json` actually exists on npm and is actively maintained (recent releases, not abandoned). Reject hallucinated or obscure lookalike names (typosquats).
- [ ] Run `npm audit` and resolve high and critical findings.
- [ ] Run a static analysis pass (for example a linter with security rules, or a scanner) and a dependency check before deploy.
- [ ] `package-lock.json` is committed so installs are reproducible.
- [ ] No package is pulled from an untrusted registry or a git URL you do not control.

---

## 5. GDPR and German Compliance (LaborLink specific)

- [ ] Personal data (names, addresses, tax IDs, bank details) is stored only where needed, access controlled by RLS, and never logged in plaintext.
- [ ] A data deletion path exists (right to erasure). A user can request removal of their personal data.
- [ ] Data is stored in an EU region where possible; document where personal data lives.
- [ ] Impressum and Datenschutzerklarung pages exist and are linked in the footer (legal requirement in Germany).
- [ ] Analytics and third party scripts do not set tracking cookies before consent.
- [ ] Transport is HTTPS only; no mixed content.

---

## 6. Pre Commit Quick Gate

Run before every commit:
1. `git status` and `git ls-files | grep -E '\.env|node_modules'` (must be empty).
2. Grep for secrets (section 2).
3. `npm audit`.
4. Confirm RLS is on for any new table (section 1.1).
5. Confirm any new input field has server side validation (section 3.1).

If any gate fails, do not commit.
