"use server";

import { updatePrivilegesForUser, getPrivilege } from "@lib/privileges";
import { revalidatePath } from "next/cache";
import { getUsers, updateActiveStatus } from "@lib/users";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

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

export const getAllUsers = AuthenticatedAction(async (_, active?: boolean) => {
  return getUsers(typeof active !== "undefined" ? { active } : undefined);
});

export const getPublishedFormsPrivilegeId = AuthenticatedAction(async () => {
  const publishPrivilege = await getPrivilege({ name: "PublishForms" });
  return publishPrivilege?.id;
});
