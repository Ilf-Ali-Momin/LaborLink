/**
 * Legal thresholds for the German student labor market.
 *
 * RULES FOR THIS FILE (from CLAUDE.md):
 * - This is the ONLY place a legal threshold may be defined. Anything
 *   user-facing that states a rule must read it from here.
 * - Every value carries a source and a last-verified date.
 * - If a figure cannot be verified, it gets a TODO and is flagged — never
 *   a plausible guess.
 *
 * This file states general rules, not legal advice. A wrong number here is
 * a real harm to a real student: treat every edit as a security-relevant change.
 */

export interface LegalThreshold<T = number> {
  value: T;
  unit: string;
  /** Statutory basis, for traceability. */
  legalBasis: string;
  /** Human-readable source we verified against. */
  sourceName: string;
  sourceUrl: string;
  /** ISO date this value was last checked against the source. */
  lastVerified: string;
}

/** Statutory minimum wage, gross per hour, from 1 Jan 2026. */
export const MINIMUM_WAGE: LegalThreshold = {
  value: 13.9,
  unit: "EUR/hour",
  legalBasis: "MiLoG, Vierte Mindestlohnanpassungsverordnung",
  sourceName: "Techniker Krankenkasse — Mindestlohn 2026",
  sourceUrl:
    "https://www.tk.de/firmenkunden/service/fachthemen/versicherung-fachthema/mindestlohn-2026-minijobs-und-uebergangsbereich-2203074",
  lastVerified: "2026-07-26",
};

/**
 * Minijob earnings ceiling per month (Geringfügigkeitsgrenze).
 * Coupled to minimum wage since Oct 2022: wage x 130 / 3, rounded up.
 */
export const MINIJOB_MONTHLY_CEILING: LegalThreshold = {
  value: 603,
  unit: "EUR/month",
  legalBasis: "§ 8 Abs. 1a SGB IV",
  sourceName: "Minijob-Zentrale — Minijob 2026",
  sourceUrl: "https://magazin.minijob-zentrale.de/minijob-2026-aenderungen/",
  lastVerified: "2026-07-26",
};

/** Minijob ceiling per year (12 x monthly). */
export const MINIJOB_ANNUAL_CEILING: LegalThreshold = {
  value: 7236,
  unit: "EUR/year",
  legalBasis: "§ 8 Abs. 1a SGB IV",
  sourceName: "Minijob-Zentrale — Minijob 2026",
  sourceUrl: "https://magazin.minijob-zentrale.de/minijob-2026-aenderungen/",
  lastVerified: "2026-07-26",
};

/**
 * Werkstudent privilege: max weekly hours during the lecture period.
 * Above this, the student loses Werkstudent status and full social
 * security contributions are due — retroactively if discovered late.
 */
export const WERKSTUDENT_WEEKLY_HOURS: LegalThreshold = {
  value: 20,
  unit: "hours/week",
  legalBasis: "§ 6 Abs. 1 Nr. 3 SGB V (Werkstudentenprivileg)",
  sourceName: "Techniker Krankenkasse — Werkstudenten FAQ",
  sourceUrl:
    "https://www.tk.de/firmenkunden/versicherung/versicherung-faq/haeufige-fragen-zu-studenten-und-praktikanten/mehrarbeit-20-std-werkstudent-vorlesungsfreie-zeit-2036718",
  lastVerified: "2026-07-26",
};

/**
 * Exception to the 20-hour cap: more than 20 h/week is allowed in the
 * lecture-free period (and evenings/weekends), for at most 26 weeks
 * (182 calendar days) within a rolling year ("Zeitjahr", counted
 * backwards from the end of the employment under assessment).
 */
export const WERKSTUDENT_OVER20_WEEKS_PER_YEAR: LegalThreshold = {
  value: 26,
  unit: "weeks/rolling year",
  legalBasis: "Werkstudentenprivileg, Spitzenverbände der Sozialversicherung",
  sourceName: "Techniker Krankenkasse — Werkstudenten FAQ",
  sourceUrl:
    "https://www.tk.de/firmenkunden/versicherung/versicherung-faq/haeufige-fragen-zu-studenten-und-praktikanten/wie-oft-duerfen-werkstudenten-ueber-20-std-arbeiten-2036712",
  lastVerified: "2026-07-26",
};

/**
 * Non-EU students on a §16b residence permit: allowed working days per
 * calendar year without Federal Employment Agency approval.
 * A day of up to 4 hours counts as a half day. Raised from 120/240 on
 * 1 March 2024.
 */
export const STUDENT_PERMIT_FULL_DAYS_PER_YEAR: LegalThreshold = {
  value: 140,
  unit: "full days/calendar year",
  legalBasis: "§ 16b Abs. 3 AufenthG",
  sourceName: "Make it in Germany (BMWK) — Studierende aus dem Ausland",
  sourceUrl:
    "https://www.make-it-in-germany.com/de/unternehmen/einreise/arbeitsmarktzulassung/studierende",
  lastVerified: "2026-07-26",
};

export const STUDENT_PERMIT_HALF_DAYS_PER_YEAR: LegalThreshold = {
  value: 280,
  unit: "half days/calendar year",
  legalBasis: "§ 16b Abs. 3 AufenthG",
  sourceName: "Make it in Germany (BMWK) — Studierende aus dem Ausland",
  sourceUrl:
    "https://www.make-it-in-germany.com/de/unternehmen/einreise/arbeitsmarktzulassung/studierende",
  lastVerified: "2026-07-26",
};

/**
 * Short-term employment (kurzfristige Beschäftigung): exempt from social
 * insurance if limited to 3 months OR 70 working days per calendar year.
 * (Agriculture gets 15 weeks / 90 days from 2026 — out of scope here.)
 */
export const KURZFRISTIG_MAX_MONTHS: LegalThreshold = {
  value: 3,
  unit: "months/calendar year",
  legalBasis: "§ 8 Abs. 1 Nr. 2 SGB IV",
  sourceName: "Minijob-Zentrale — Kurzfristige Beschäftigung",
  sourceUrl:
    "https://www.minijob-zentrale.de/DE/die-minijobs/kurzfristige-beschaeftigung",
  lastVerified: "2026-07-26",
};

export const KURZFRISTIG_MAX_WORKING_DAYS: LegalThreshold = {
  value: 70,
  unit: "working days/calendar year",
  legalBasis: "§ 8 Abs. 1 Nr. 2 SGB IV",
  sourceName: "Minijob-Zentrale — Kurzfristige Beschäftigung",
  sourceUrl:
    "https://www.minijob-zentrale.de/DE/die-minijobs/kurzfristige-beschaeftigung",
  lastVerified: "2026-07-26",
};

/** Everything above, for the /compliance sources block and audits. */
export const ALL_THRESHOLDS = [
  MINIMUM_WAGE,
  MINIJOB_MONTHLY_CEILING,
  MINIJOB_ANNUAL_CEILING,
  WERKSTUDENT_WEEKLY_HOURS,
  WERKSTUDENT_OVER20_WEEKS_PER_YEAR,
  STUDENT_PERMIT_FULL_DAYS_PER_YEAR,
  STUDENT_PERMIT_HALF_DAYS_PER_YEAR,
  KURZFRISTIG_MAX_MONTHS,
  KURZFRISTIG_MAX_WORKING_DAYS,
] as const;
