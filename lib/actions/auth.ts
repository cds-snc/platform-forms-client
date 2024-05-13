"use server";

import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";

export const authCheck = async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return { ability: createAbility(session), session };
};
