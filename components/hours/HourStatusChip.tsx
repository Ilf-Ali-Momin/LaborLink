import type { Database } from "@/lib/database.types";

type HourStatus = Database["public"]["Enums"]["hour_entry_status"];

/**
 * Provenance of an hour record. Wording is plain: the reader may be
 * anxious and reading in a third language, and the distinction between
 * "your claim" and "your employer agreed" is the whole point.
 */
const config: Record<HourStatus, { label: string; dot: string }> = {
  self_reported: { label: "Not confirmed", dot: "bg-smoke" },
  confirmed: { label: "Confirmed by employer", dot: "bg-under" },
  corrected: { label: "Corrected by employer", dot: "bg-near" },
};

export function HourStatusChip({
  status,
  ground = "void",
}: {
  status: HourStatus;
  ground?: "void" | "paper";
}) {
  const { label, dot } = config[status];
  const border = ground === "void" ? "border-ash text-paper/80" : "border-hairline text-void";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${border}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
