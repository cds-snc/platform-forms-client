"use server";
import { createKey, deleteKey, refreshKey } from "@lib/serviceAccount";
import { revalidatePath } from "next/cache";
import { checkOne } from "@lib/cache/flags";
// TODO: Implement error handling once we have designs and messaging for this interface

export const createServiceAccountKey = async (templateId: string) => {
  const flag = await checkOne("zitadelAuth");
  if (!flag) throw new Error("Zitadel Auth flag is not active");

  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );
  return createKey(templateId);
};

export const refreshServiceAccountKey = async (templateId: string) => {
  const flag = await checkOne("zitadelAuth");
  if (!flag) throw new Error("Zitadel Auth flag is not active");
  return refreshKey(templateId);
};

export const deleteServiceAccountKey = async (templateId: string) => {
  const flag = await checkOne("zitadelAuth");
  if (!flag) throw new Error("Zitadel Auth flag is not active");
  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );
  return deleteKey(templateId);
};
