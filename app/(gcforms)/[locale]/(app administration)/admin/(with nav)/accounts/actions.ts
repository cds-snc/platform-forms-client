"use server";

import { checkPrivilegesAsBoolean, updatePrivilegesForUser, getPrivilege } from "@lib/privileges";
import { revalidatePath } from "next/cache";
import { getUsers, updateActiveStatus } from "@lib/users";
import { authCheckAndThrow } from "@lib/actions";

export const updatePublishing = async (
  userID: string,
  publishFormsId: string,
  action: "add" | "remove"
) => {
  const { ability } = await authCheckAndThrow();
  if (checkPrivilegesAsBoolean(ability, [{ action: "update", subject: "User" }])) {
    await updatePrivilegesForUser(ability, userID, [{ id: publishFormsId, action }]);
    revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts", "page");
  }
};

export const updateActive = async (userID: string, active: boolean) => {
  const { ability } = await authCheckAndThrow();

  if (checkPrivilegesAsBoolean(ability, [{ action: "update", subject: "User" }])) {
    await updateActiveStatus(ability, userID, active);
    revalidatePath("(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts", "page");
  }
};

export const getAllUsers = async (active?: boolean) => {
  const { ability } = await authCheckAndThrow();
  return getUsers(ability, typeof active !== "undefined" ? { active } : undefined);
};

export const getPublishedFormsPrivilegeId = async () => {
  const { ability } = await authCheckAndThrow();
  const publishPrivilege = await getPrivilege(ability, { name: "PublishForms" });
  return publishPrivilege?.id;
};
