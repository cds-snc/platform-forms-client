"use server";
import { AuthenticatedAction } from "@lib/actions";
import { updatePrivilegesForUser } from "@lib/privileges";
import { revalidatePath } from "next/cache";
import { updateActiveStatus } from "@lib/users";

export const updatePublishing = AuthenticatedAction(
  async (_, userID: string, publishFormsId: string, action: "add" | "remove") => {
    await updatePrivilegesForUser(userID, [{ id: publishFormsId, action }]);
    revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts", "page");
  }
);

export const updateActive = AuthenticatedAction(async (_, userID: string, active: boolean) => {
  await updateActiveStatus(userID, active);
  revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts", "page");
});
