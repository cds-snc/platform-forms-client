"use server";

import { createKey, deleteKey } from "@lib/serviceAccount";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getReadmeContent = AuthenticatedAction(async () => {
  try {
    const readmePath = path.join(process.cwd(), "./public/static/api/Readme.md");
    const content = await fs.readFile(readmePath, "utf-8");
    return { content };
  } catch (e) {
    return { error: true };
  }
});

export const createServiceAccountKey = AuthenticatedAction(async (_, templateId: string) => {
  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api",
    "page"
  );
  return createKey(templateId);
});

export const deleteServiceAccountKey = AuthenticatedAction(async (_, templateId: string) => {
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
});
