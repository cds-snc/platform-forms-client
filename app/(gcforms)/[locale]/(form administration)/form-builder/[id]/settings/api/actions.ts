"use server";
import { createKey, deleteKey, refreshKey } from "@lib/serviceAccount";
import { revalidatePath } from "next/cache";

// TODO: Implement error handling once we have designs and messaging for this interface

// Privilege Checks are done at the lib/serviceAccount.ts level

export const createServiceAccountKey = async (templateId: string) => {
  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );
  return createKey(templateId);
};

export const refreshServiceAccountKey = async (templateId: string) => {
  return refreshKey(templateId);
};

export const deleteServiceAccountKey = async (templateId: string) => {
  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );
  return deleteKey(templateId);
};
