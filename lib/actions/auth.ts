"use server";

import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { cache } from "react";
import { serverTranslation } from "@i18n";
import { redirect } from "next/navigation";

const authInteralCached = cache(async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return { ability: createAbility(session), session };
});

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
