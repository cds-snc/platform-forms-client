"use server";

import { cookies } from "next/headers";

const RESPONSES_PILOT_COOKIE = "responses-pilot-mode";

/**
 * Set cookie to enable responses-pilot mode
 */
export async function enableResponsesPilotMode() {
  const cookieStore = await cookies();
  cookieStore.set(RESPONSES_PILOT_COOKIE, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

/**
 * Clear the responses-pilot mode cookie
 */
export async function disableResponsesPilotMode() {
  const cookieStore = await cookies();
  cookieStore.delete(RESPONSES_PILOT_COOKIE);
}

/**
 * Check if responses-pilot mode is enabled via cookie
 */
export async function isResponsesPilotModeEnabled(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(RESPONSES_PILOT_COOKIE);
  return cookie?.value === "true";
}
