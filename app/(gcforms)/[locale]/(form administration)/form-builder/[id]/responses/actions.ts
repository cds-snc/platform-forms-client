"use server";

import { cookies } from "next/headers";

const RESPONSES_BETA_COOKIE = "responses-beta-mode";

/**
 * Set cookie to enable responses-beta mode
 */
export async function enableResponsesBetaMode() {
  const cookieStore = await cookies();
  cookieStore.set(RESPONSES_BETA_COOKIE, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

/**
 * Clear the responses-beta mode cookie
 */
export async function disableResponsesBetaMode() {
  const cookieStore = await cookies();
  cookieStore.delete(RESPONSES_BETA_COOKIE);
}

/**
 * Check if responses-beta mode is enabled via cookie
 */
export async function isResponsesBetaModeEnabled(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(RESPONSES_BETA_COOKIE);
  return cookie?.value === "true";
}
