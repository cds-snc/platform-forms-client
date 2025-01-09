import { auth } from "@lib/auth";

import { redirect } from "next/navigation";
import { getCurrentLanguage } from "@i18n";
import { getAbility } from "@lib/privileges";

export const AuthenticatedAction = <Input extends unknown[], R>(
  action: (...args: Input) => Promise<R>
) => {
  return async (...args: Input) => {
    const session = await auth();
    if (session === null) {
      const language = await getCurrentLanguage();
      redirect(`/${language}/auth/login`);
    }
    return action(...args);
  };
};

export const authCheckAndThrow = async () => {
  const session = await auth();
  if (session === null) {
    throw new Error("User not authenticated");
  }
  const ability = await getAbility();
  return { ability, session };
};

export const authCheckAndRedirect = async () => {
  return authCheckAndThrow().catch(async () => {
    const language = await getCurrentLanguage();
    redirect(`/${language}/auth/login`);
  });
};
