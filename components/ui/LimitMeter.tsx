import { meterState, type MeterState } from "@/lib/compliance/logic";

/**
 * The limit meter — LaborLink's signature element. A horizontal bar with a
 * hard vertical rule at the legal threshold. Nothing else in the interface
 * uses this shape.
 *
 * The bar's track runs 25% past the limit so "over" is visible; the rule
 * therefore sits at 80% of the track. The number is always printed beside
 * the bar — color is never the only carrier of meaning.
 *
 * Fill animates via the .meter-fill class on data change only (CSS
 * transition; instant under reduced motion).
 */

const stateColor: Record<MeterState, string> = {
  under: "var(--color-under)",
  near: "var(--color-near)",
  over: "var(--color-over)",
};

const stateLabel: Record<MeterState, string> = {
  under: "Within the limit",
  near: "Close to the limit",
  over: "Over the limit",
};

interface MeterProps {
  value: number;
  limit: number;
  /** Unit shown after the numbers, e.g. "h" or "€". */
  unit: string;
  label: string;
  scale?: "hero" | "strip" | "rule";
  /** Second line under the label, e.g. the week range. */
  sublabel?: string;
  /** Dark ground inverts the track/text colors. */
  ground?: "void" | "paper";
}

const OVERRUN = 1.25; // track extends 25% past the limit
const RULE_AT = `${(100 / OVERRUN).toFixed(4)}%`;

export function LimitMeter({
  value,
  limit,
  unit,
  label,
  scale = "strip",
  sublabel,
  ground = "paper",
}: MeterProps) {
  const state = meterState(value, limit);
  const fillPct = Math.min(value / (limit * OVERRUN), 1) * 100;
  const dark = ground === "void";
  const track = dark ? "bg-ash" : "bg-hairline";
  const ruleColor = dark ? "bg-paper" : "bg-void";
  const mutedText = dark ? "text-paper/60" : "text-smoke";
  const mainText = dark ? "text-paper" : "text-void";

  const barHeight =
    scale === "hero" ? "h-4" : scale === "strip" ? "h-1" : "h-0.5";

  const meterA11y = {
    role: "meter" as const,
    "aria-valuemin": 0,
    "aria-valuemax": limit,
    "aria-valuenow": Math.min(value, limit * OVERRUN),
    "aria-label": `${label}: ${value} of ${limit} ${unit}. ${stateLabel[state]}.`,
  };

  return (
    <div className={scale === "hero" ? "space-y-4" : "space-y-1.5"}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className={`eyebrow ${mutedText}`}>{label}</div>
          {sublabel ? (
            <div className={`text-sm ${mutedText}`}>{sublabel}</div>
          ) : null}
        </div>
        <div
          className={`font-mono tabular-nums ${mainText} ${
            scale === "hero" ? "text-display-m font-medium" : "text-sm"
          }`}
        >
          {formatNum(value)}
          <span className={mutedText}> / {formatNum(limit)} {unit}</span>
        </div>
      </div>

      <div className={`relative w-full ${barHeight} ${track}`} {...meterA11y}>
        <div
          className={`meter-fill absolute inset-y-0 left-0`}
          style={{ width: `${fillPct}%`, background: stateColor[state] }}
        />
        {/* The hard rule at the legal threshold. */}
        <div
          className={`absolute w-0.5 ${ruleColor}`}
          style={{
            left: RULE_AT,
            top: scale === "hero" ? "-6px" : "-3px",
            bottom: scale === "hero" ? "-6px" : "-3px",
          }}
        />
      </div>

      <div className={`text-sm ${scale === "rule" ? "sr-only" : ""} ${state === "over" ? "text-over" : state === "near" ? (dark ? "text-near" : "text-void") : mutedText}`}>
        {stateLabel[state]}
        {state !== "over"
          ? ` — ${formatNum(Math.max(limit - value, 0))} ${unit} left`
          : ` by ${formatNum(value - limit)} ${unit}`}
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
