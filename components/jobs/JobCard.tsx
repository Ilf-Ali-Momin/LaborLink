import Link from "next/link";
import { TypeChip } from "@/components/ui/StatusChip";
import {
  complianceReadForListing,
  formatEurCents,
  formatHours,
  type ListingType,
} from "@/lib/compliance/logic";
import { WERKSTUDENT_WEEKLY_HOURS } from "@/lib/compliance/config";

export interface JobCardData {
  slug: string;
  title: string;
  type: ListingType;
  city: string | null;
  remote: boolean;
  hourly_wage_cents: number;
  hours_per_week: number;
  employerName: string;
}

const stateDot = {
  under: "bg-under",
  near: "bg-near",
  over: "bg-over",
} as const;

export function JobCard({ job }: { job: JobCardData }) {
  const read = complianceReadForListing({
    type: job.type,
    hoursPerWeek: Number(job.hours_per_week),
    hourlyWageCents: job.hourly_wage_cents,
  });

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="card-lift block border border-hairline bg-paper p-6 rounded-r"
    >
      <div className="flex items-center justify-between gap-3">
        <TypeChip type={job.type} />
        {job.remote ? <span className="text-sm text-smoke">Remote possible</span> : null}
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold leading-tight tracking-[-0.02em]">
        {job.title}
      </h3>
      <p className="mt-1 text-smoke">
        {job.employerName}
        {job.city ? ` · ${job.city}` : ""}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 border-t border-hairline pt-4">
        <div>
          <dt className="text-sm text-smoke">Wage</dt>
          <dd className="font-mono tabular-nums">{formatEurCents(job.hourly_wage_cents)}/h</dd>
        </div>
        <div>
          <dt className="text-sm text-smoke">Hours</dt>
          <dd className="font-mono tabular-nums">
            {formatHours(Number(job.hours_per_week))} h/week
            {job.type === "werkstudent" ? (
              <span className="text-smoke"> of {WERKSTUDENT_WEEKLY_HOURS.value}</span>
            ) : null}
          </dd>
        </div>
      </dl>

      <p className="mt-4 flex items-start gap-2 text-sm text-smoke">
        <span aria-hidden className={`mt-1.5 size-1.5 shrink-0 rounded-full ${stateDot[read.state]}`} />
        {read.lines[0]}
      </p>
    </Link>
  );
}
