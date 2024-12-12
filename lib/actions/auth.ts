import { auth } from "@lib/auth";

import { redirect } from "next/navigation";
import { getCurrentLanguage } from "@i18n";
import { getAbility } from "@lib/privileges";

export const AuthenticatedAction = <Output>(
  action: (...args: unknown[]) => Promise<Output>,
  redirectOnFail?: boolean
) => {
  return async (...args: unknown[]) => {
    const session = await auth();
    if (session === null) {
      if (redirectOnFail) {
        const language = await getCurrentLanguage();
        redirect(`/${language}/auth/login`);
      } else {
        throw new Error("User is not Authenticated");
      }
    }
    return action(...args);
  };
};

export const authCheckAndThrow = async () => {
  const session = await auth();
  const ability = await getAbility();
  return { ability, session };
};

export const authCheckAndRedirect = async () => {
  return authCheckAndThrow().catch(async () => {
    const language = await getCurrentLanguage();
    redirect(`/${language}/auth/login`);
  });
};
