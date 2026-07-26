import {
  MINIMUM_WAGE,
  MINIJOB_MONTHLY_CEILING,
  WERKSTUDENT_WEEKLY_HOURS,
  KURZFRISTIG_MAX_MONTHS,
  KURZFRISTIG_MAX_WORKING_DAYS,
} from "@/lib/compliance/config";

const inputClass =
  "mt-1.5 w-full border border-hairline bg-paper p-3 rounded-r outline-none focus:border-void";

export interface ListingFormDefaults {
  id?: string;
  title?: string;
  type?: string;
  description?: string;
  city?: string | null;
  remote?: boolean;
  wage?: number;
  hours?: number;
}

const errorMessages: Record<string, string> = {
  missing: "Title, type, and description are required.",
  numbers: "Check wage and hours — hours must be between 0 and 48.",
  minwage: `The wage is below the legal minimum of €${MINIMUM_WAGE.value.toFixed(2)}/hour. It cannot be posted.`,
  "werkstudent-hours": `A Werkstudent role cannot exceed ${WERKSTUDENT_WEEKLY_HOURS.value} hours per week during the lecture period.`,
  "minijob-ceiling": `At this wage and these hours, monthly pay would exceed the €${MINIJOB_MONTHLY_CEILING.value} Minijob ceiling. Reduce hours, or post it as a Werkstudent role.`,
  failed: "Saving failed. Try again.",
  limit:
    "You are at your active-listing limit. Close another listing or upgrade your plan.",
};

export function listingErrorMessage(code?: string): string | null {
  return code ? (errorMessages[code] ?? errorMessages.failed) : null;
}

/** Shared create/edit form. Validation is server-side, against config. */
export function ListingForm({
  action,
  defaults = {},
  submitLabel,
  errorCode,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: ListingFormDefaults;
  submitLabel: string;
  errorCode?: string;
}) {
  const error = listingErrorMessage(errorCode);

  return (
    <form action={action} className="mt-8 max-w-2xl space-y-5">
      {defaults.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      {error ? <p className="border-l-2 border-over pl-4">{error}</p> : null}

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Role title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaults.title ?? ""}
          placeholder="Working student: marketing analytics"
          className={inputClass}
        />
      </div>

      <fieldset className="border border-hairline p-5 rounded-r">
        <legend className="px-2 text-sm font-medium">Contract type</legend>
        <div className="space-y-3">
          {(
            [
              [
                "werkstudent",
                "Werkstudent",
                `Up to ${WERKSTUDENT_WEEKLY_HOURS.value} h/week during the lecture period. Reduced social contributions.`,
              ],
              [
                "minijob",
                "Minijob",
                `Up to €${MINIJOB_MONTHLY_CEILING.value}/month. Flat-rate taxation.`,
              ],
              [
                "kurzfristig",
                "Short-term",
                `Max ${KURZFRISTIG_MAX_MONTHS.value} months or ${KURZFRISTIG_MAX_WORKING_DAYS.value} working days per calendar year.`,
              ],
            ] as const
          ).map(([value, label, hint]) => (
            <label key={value} className="flex items-start gap-3">
              <input
                type="radio"
                name="type"
                value={value}
                required
                defaultChecked={defaults.type === value}
                className="mt-1 accent-[var(--color-signal-dk)]"
              />
              <span>
                <span className="font-medium">{label}</span>
                <span className="block text-sm text-smoke">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="wage" className="text-sm font-medium">
            Wage (€/hour, gross)
          </label>
          <input
            id="wage"
            name="wage"
            type="number"
            step="0.10"
            min={MINIMUM_WAGE.value}
            required
            defaultValue={defaults.wage ?? ""}
            className={`${inputClass} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="hours" className="text-sm font-medium">
            Hours per week
          </label>
          <input
            id="hours"
            name="hours"
            type="number"
            step="0.5"
            min="1"
            max="48"
            required
            defaultValue={defaults.hours ?? ""}
            className={`${inputClass} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <input
            id="city"
            name="city"
            defaultValue={defaults.city ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="remote"
          defaultChecked={defaults.remote ?? false}
          className="accent-[var(--color-signal-dk)]"
        />
        Remote work is possible
      </label>

      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <p className="text-sm text-smoke">
          Plain words. What the person does, what they need, who they work
          with. Use “- ” at line start for bullet points.
        </p>
        <textarea
          id="description"
          name="description"
          rows={10}
          required
          maxLength={10000}
          defaultValue={defaults.description ?? ""}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="rounded-r bg-signal px-6 py-3 font-medium text-void transition-colors duration-200 hover:bg-void hover:text-signal"
      >
        {submitLabel}
      </button>
    </form>
  );
}
