"use server";

import { auth } from "@lib/auth";

import { serverTranslation } from "@i18n";
import { redirect } from "next/navigation";

import { getAbility } from "@lib/privileges";

export const authCheckAndThrow = async () => {
  const session = await auth();
  const ability = await getAbility();
  return { ability, session };
};

export const authCheckAndRedirect = async () => {
  const {
    i18n: { language },
  } = await serverTranslation();
  return authCheckAndThrow().catch(() => {
    redirect(`/${language}/auth/login`);
  });
};
