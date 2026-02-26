"use server";

import { auth, signOut } from "@lib/auth";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const logout = async (locale: string) => {
  const session = await auth();
  const isOidc = session?.user.accountUrl !== undefined;
  const redirectTo = `/${locale}/auth/logout${isOidc ? "?oidc=1" : ""}`;

  await signOut({ redirect: true, redirectTo });
};
