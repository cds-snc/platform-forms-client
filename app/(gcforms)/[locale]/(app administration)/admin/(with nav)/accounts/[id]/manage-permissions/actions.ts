"use server";
import { updatePrivilegesForUser } from "@lib/privileges";

import { revalidatePath } from "next/cache";
import { authCheck } from "@lib/actions";

export const updatePrivileges = async (
  userID: string,
  privilegeID: string,
  action: "add" | "remove"
) => {
  const { ability } = await authCheck();
  if (ability.can("update", "User")) {
    await updatePrivilegesForUser(ability, userID, [{ id: privilegeID, action }]);
    revalidatePath(
      "(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts/[id]/manage-permissions",
      "page"
    );
  }
};
