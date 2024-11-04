"use server";
import { createKey, deleteKey, refreshKey } from "@lib/serviceAccount";
import { revalidatePath } from "next/cache";

import { promises as fs } from "fs";
import path from "path";

// Privilege Checks are done at the lib/serviceAccount.ts level

export const getReadmeContent = async () => {
  const readmePath = path.join(__dirname, "./api/templates/Readme.md");
  const readmeContent = await fs.readFile(readmePath, "utf-8");
  return readmeContent;
};

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
  try {
    await deleteKey(templateId);
    revalidatePath(
      "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
      "page"
    );
    return { templateId: templateId };
  } catch (e) {
    return { error: true, templateId: templateId };
  }
};
