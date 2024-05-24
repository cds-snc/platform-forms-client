"use server";

import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { cache } from "react";

const authInteralCached = cache(async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return { ability: createAbility(session), session };
});

export const authCheck = async () => {
  return authInteralCached();
};
