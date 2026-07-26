import Link from "next/link";

const col = "space-y-3 text-paper/70";
const link = "link-grow text-paper/70 hover:text-paper";

export function SiteFooter() {
  return (
    <footer className="bg-void text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl font-bold tracking-[-0.02em]">
              Labor<span className="text-signal">Link</span>
            </p>
            <p className="mt-3 max-w-xs text-paper/70">
              Student jobs in Germany, with the legal limits built in.
            </p>
          </div>
          <nav aria-label="Product" className={col}>
            <p className="eyebrow text-paper">Product</p>
            <p><Link className={link} href="/jobs">Jobs</Link></p>
            <p><Link className={link} href="/companies">Companies</Link></p>
            <p><Link className={link} href="/compliance">The rules</Link></p>
            <p><Link className={link} href="/pricing">Pricing</Link></p>
          </nav>
          <nav aria-label="For employers" className={col}>
            <p className="eyebrow text-paper">Employers</p>
            <p><Link className={link} href="/for-employers">Why LaborLink</Link></p>
            <p><Link className={link} href="/signup?role=employer">Post a job</Link></p>
          </nav>
          <nav aria-label="Legal" className={col}>
            <p className="eyebrow text-paper">Legal</p>
            <p><Link className={link} href="/impressum">Impressum</Link></p>
            <p><Link className={link} href="/datenschutz">Datenschutz</Link></p>
            <p><Link className={link} href="/agb">AGB</Link></p>
          </nav>
        </div>
        <div className="mt-14 border-t border-ash pt-6 text-sm text-paper/50">
          <p>
            LaborLink explains legal rules in plain language. It is not legal
            advice. Data is stored in Frankfurt, Germany.
          </p>
        </div>
      </div>
    </footer>
  );
}
