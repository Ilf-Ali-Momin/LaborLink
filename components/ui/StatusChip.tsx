import type { Database } from "@/lib/database.types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

// Plain words. A chip says what the state is, not how to feel about it.
const config: Record<ApplicationStatus, { label: string; dot: string }> = {
  submitted: { label: "Sent", dot: "bg-smoke" },
  in_review: { label: "In review", dot: "bg-near" },
  interview: { label: "Interview", dot: "bg-near" },
  offer: { label: "Offer", dot: "bg-under" },
  hired: { label: "Hired", dot: "bg-under" },
  rejected: { label: "Not selected", dot: "bg-over" },
  withdrawn: { label: "Withdrawn", dot: "bg-smoke" },
};

export function StatusChip({ status }: { status: ApplicationStatus }) {
  const { label, dot } = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-sm">
      <span aria-hidden className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function TypeChip({
  type,
  ground = "paper",
}: {
  type: Database["public"]["Enums"]["listing_type"];
  ground?: "void" | "paper";
}) {
  const labels = {
    werkstudent: "Werkstudent",
    minijob: "Minijob",
    kurzfristig: "Short-term",
  } as const;
  const border = ground === "void" ? "border-paper/30 text-paper" : "border-hairline text-void";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${border}`}>
      {labels[type]}
    </span>
  );
}
