import { auth } from "@lib/auth";

import { redirect } from "next/navigation";
import { getCurrentLanguage } from "@i18n/utils";
import { getAbility } from "@lib/privileges";
import { Session } from "next-auth";

export const AuthenticatedAction = <Input extends unknown[], R>(
  action: (session: Session, ...args: Input) => Promise<R>
) => {
  return async (...args: Input) => {
    const session = await auth();
    if (session === null) {
      const language = await getCurrentLanguage();
      redirect(`/${language}/auth/login`);
    }
    return action(session, ...args);
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
