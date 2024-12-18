"use server";

import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { cache } from "react";
import { serverTranslation } from "@i18n";
import { redirect } from "next/navigation";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const authCheckAndThrow = async () => {
  return authInteralCached();
};

export const authCheckAndRedirect = async () => {
  const {
    i18n: { language },
  } = await serverTranslation();
  return authInteralCached().catch(() => {
    redirect(`/${language}/auth/login`);
  });
};

// Internal and private functions - won't be converted into server actions

const authInteralCached = cache(async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return { ability: createAbility(session), session };
});
