"use server";

import { updatePrivilegesForUser } from "@lib/privileges";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const updatePrivileges = AuthenticatedAction(
  async (userID: string, privilegeID: string, action: "add" | "remove") => {
    try {
      const result = await updatePrivilegesForUser(userID, [{ id: privilegeID, action }]);
      revalidatePath(
        "(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts/[id]/manage-permissions",
        "page"
      );
      return { data: result };
    } catch (e) {
      return { error: "Failed to update permissions." };
    }
  }
);
