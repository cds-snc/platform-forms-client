import { auth } from "@lib/auth";

import { redirect } from "next/navigation";
import { getCurrentLanguage } from "@i18n";
import { getAbility } from "@lib/privileges";

export const AuthenticatedAction = <Input, Output>(action: (args: Input) => Promise<Output>) => {
  return async (...args: unknown[]) => {
    const session = await auth();
    if (session === null) {
      const language = await getCurrentLanguage();
      redirect(`/${language}/auth/login`);
    }
    return action(...(args as Parameters<typeof action>));
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
