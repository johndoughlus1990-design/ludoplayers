import type { User } from "@supabase/supabase-js";

/**
 * True when the account can already sign in with email + password.
 * Supabase exposes an "email" identity for password accounts; for accounts
 * created through Google we also record a flag in user metadata once the
 * password has been set, because the identity list may not change.
 */
export function hasPasswordLogin(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.user_metadata?.["password_set"] === true) return true;
  return (user.identities ?? []).some((i) => i.provider === "email");
}
