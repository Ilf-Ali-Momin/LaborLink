/**
 * The diagonal wedge — the design's signature seam between two grounds.
 * Renders as a block of the lower color with the upper color cut across it.
 */
export function Seam({
  from,
  to,
  direction = "down",
  className = "",
}: {
  /** Color of the block above (CSS color or var). */
  from: string;
  /** Color of the block below. */
  to: string;
  direction?: "down" | "up";
  className?: string;
}) {
  const clip =
    direction === "down"
      ? "polygon(0 0, 100% 0, 100% 0, 0 100%)"
      : "polygon(0 0, 100% 0, 100% 100%, 100% 100%, 0 0)";
  return (
    <div
      aria-hidden
      className={`relative h-16 w-full sm:h-24 ${className}`}
      style={{ background: to }}
    >
      <div
        className="absolute inset-0"
        style={{ background: from, clipPath: clip }}
      />
    </div>
  );
}
