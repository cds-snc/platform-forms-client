"use server";

import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { getUsers } from "@lib/users";

export const checkEmailExists = async (email: string) => {
  const session = await auth();
  const ability = session && createAbility(session);

  const users = ability && (await getUsers(ability, { email }));

  return users && users.length > 0;
  // return "huzzah";
};
