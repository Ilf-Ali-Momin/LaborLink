import {
  MINIJOB_MONTHLY_CEILING,
  WERKSTUDENT_WEEKLY_HOURS,
} from "./config";

export type MeterState = "under" | "near" | "over";

/** Amber begins in the last 15% before the limit (DESIGN.md). */
const NEAR_FRACTION = 0.85;

export function meterState(value: number, limit: number): MeterState {
  if (value > limit) return "over";
  if (value >= limit * NEAR_FRACTION) return "near";
  return "under";
}

export type ListingType = "werkstudent" | "minijob" | "kurzfristig";

export interface ComplianceRead {
  state: MeterState;
  /** Short, plain-language line for the listing page. */
  lines: string[];
}

/**
 * The compliance read for a specific role: what these hours and this wage
 * mean against the legal limits. Plain words — the reader may be anxious
 * and reading in a third language.
 */
export function complianceReadForListing(input: {
  type: ListingType;
  hoursPerWeek: number;
  hourlyWageCents: number;
}): ComplianceRead {
  const { type, hoursPerWeek, hourlyWageCents } = input;
  const monthlyEur = (hourlyWageCents / 100) * hoursPerWeek * 4.33;
  const lines: string[] = [];
  let state: MeterState = "under";

  if (type === "werkstudent") {
    const cap = WERKSTUDENT_WEEKLY_HOURS.value;
    state = meterState(hoursPerWeek, cap);
    if (hoursPerWeek <= cap) {
      lines.push(
        `${formatHours(hoursPerWeek)} hours per week. The legal limit during the lecture period is ${cap}.`,
      );
      if (state === "near") {
        lines.push(
          `This role uses almost all of your ${cap} hours. A second job during the semester would put you over the limit.`,
        );
      }
    } else {
      lines.push(
        `${formatHours(hoursPerWeek)} hours per week is over the ${cap}-hour limit for the lecture period. This can only be legal in semester breaks.`,
      );
    }
  }

  if (type === "minijob") {
    const ceiling = MINIJOB_MONTHLY_CEILING.value;
    state = meterState(monthlyEur, ceiling);
    lines.push(
      `About ${formatEur(monthlyEur)} per month at these hours. The Minijob ceiling is ${formatEur(ceiling)}.`,
    );
    if (state === "over") {
      lines.push(
        `That is over the ceiling. The employer must reduce hours or run this as a normal employment.`,
      );
    } else if (state === "near") {
      lines.push(
        `That is close to the ceiling. Extra hours in a month could push you over it.`,
      );
    }
  }

  if (type === "kurzfristig") {
    lines.push(
      `Short-term employment. Limited to 3 months or 70 working days in a calendar year, across all short-term jobs.`,
    );
  }

  return { state, lines };
}

export function formatEur(v: number): string {
  return new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatEurCents(cents: number): string {
  return new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatHours(h: number): string {
  return Number.isInteger(h) ? String(h) : h.toFixed(1);
}
