/** LaborLink wordmark: blue rounded square with an L and a green trust dot. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <a
      href="#home"
      className={`inline-flex items-center gap-2 font-semibold tracking-tight text-ink ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="8" fill="rgb(var(--c-primary))" />
        <path d="M11 8v13h10v-3h-6.5V8H11z" fill="#fff" />
        <circle cx="23" cy="10" r="3" fill="rgb(var(--c-success))" />
      </svg>
      <span className="text-[17px]">laborlink</span>
    </a>
  )
}
