import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safe-path";

const VALID_TYPES: EmailOtpType[] = [
  "signup",
  "email",
  "email_change",
  "recovery",
  "invite",
  "magiclink",
];

/**
 * Where an email confirmation link lands.
 *
 * Handles both shapes Supabase can send:
 *  - token_hash + type  (the SSR-recommended flow; works on any device)
 *  - code               (PKCE; only works on the device that signed up,
 *                        because the verifier lives in a cookie there)
 *
 * On success the user already has a session, so they go straight into the
 * app rather than being asked to log in again.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const code = searchParams.get("code");
  // An attacker-supplied "next" is a redirect target: allowlist it.
  const next = safeInternalPath(searchParams.get("next"));

  const supabase = await createClient();
  let confirmed = false;

  if (tokenHash && typeParam && VALID_TYPES.includes(typeParam as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: typeParam as EmailOtpType,
      token_hash: tokenHash,
    });
    confirmed = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    confirmed = !error;
  }

  if (!confirmed) {
    // Generic message; never say whether the token was unknown or expired.
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  // A password recovery link should land on the reset screen, not the app.
  if (typeParam === "recovery") {
    return NextResponse.redirect(`${origin}${next ?? "/login?recovery=1"}`);
  }

  if (next) return NextResponse.redirect(`${origin}${next}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return NextResponse.redirect(
    profile?.role === "employer"
      ? `${origin}/employer`
      : `${origin}/dashboard/profile?welcome=1`,
  );
}
