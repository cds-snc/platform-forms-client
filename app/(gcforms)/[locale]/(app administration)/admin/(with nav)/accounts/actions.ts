"use server";

import { updatePrivilegesForUser } from "@lib/privileges";
import { auth } from "@lib/auth";
import { createAbility, getPrivilege } from "@lib/privileges";
import { revalidatePath } from "next/cache";
import { getUsers, updateActiveStatus } from "@lib/users";
import { redirect } from "next/navigation";

const authCheck = async () => {
  const session = await auth();
  if (!session) throw new Error("No session found");
  return createAbility(session);
};

export const updatePublishing = async (
  userID: string,
  publishFormsId: string,
  action: "add" | "remove"
) => {
  const ability = await authCheck();
  if (ability.can("update", "User")) {
    await updatePrivilegesForUser(ability, userID, [{ id: publishFormsId, action }]);
    revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts");
  }
};

export const updateActive = async (userID: string, active: boolean) => {
  const ability = await authCheck();

  if (ability.can("update", "User")) {
    await updateActiveStatus(ability, userID, active);
    revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts");
  }
};

export const serverRedirect = async (path: string) => {
  return redirect(path);
};

export const getAllUsers = async (active?: boolean) => {
  const ability = await authCheck();
  return getUsers(ability, typeof active !== "undefined" ? { active } : undefined);
};

export const getPublishedFormsPrivilegeId = async () => {
  const ability = await authCheck();
  const publishPrivilege = await getPrivilege(ability, { name: "PublishForms" });
  return publishPrivilege?.id;
};
