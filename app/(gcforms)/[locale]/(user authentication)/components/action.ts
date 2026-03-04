"use server";

import { signOut } from "@lib/auth";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const logout = async (locale: string) => {
  const redirectTo = `/${locale}/auth/logout`;

  await signOut({ redirect: true, redirectTo });
};
