/**
 * Internal redirect targets only, on a strict allowlist of characters.
 *
 * A "starts with / but not //" check is not enough: browsers normalise a
 * backslash to a forward slash, so "/\evil.com" becomes "//evil.com" — a
 * protocol-relative URL that leaves the site entirely. For this audience
 * that is a ready-made phishing route, so this is an allowlist.
 */
const SAFE_INTERNAL_PATH = /^\/(?!\/)[A-Za-z0-9\-._~/]*$/;

export function safeInternalPath(raw: unknown): string | null {
  const value = typeof raw === "string" ? raw : "";
  return SAFE_INTERNAL_PATH.test(value) ? value : null;
}
