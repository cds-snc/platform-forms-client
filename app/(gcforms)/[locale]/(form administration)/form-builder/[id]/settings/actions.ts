"use server";

import { createKey, deleteKey, refreshKey } from "@lib/serviceAccount";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";

import { submissionTypeExists } from "@lib/vault";
import { VaultStatus } from "@lib/types";
import { ServerActionError } from "@root/lib/types/form-builder-types";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const createServiceAccountKey = AuthenticatedAction(async (_, templateId: string) => {
  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api-integration",
    "page"
  );
  return createKey(templateId);
});

export const refreshServiceAccountKey = AuthenticatedAction(async (_, templateId: string) => {
  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api-integration",
    "page"
  );
  return refreshKey(templateId);
});

export const deleteServiceAccountKey = AuthenticatedAction(async (_, templateId: string) => {
  try {
    await deleteKey(templateId);
    revalidatePath(
      "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api-integration",
      "page"
    );
    return { templateId: templateId };
  } catch (e) {
    return { error: true, templateId: templateId };
  }
});

export const unConfirmedResponsesExist = AuthenticatedAction(async (_, formId: string) => {
  try {
    return submissionTypeExists(formId, VaultStatus.DOWNLOADED);
  } catch (error) {
    // Throw sanitized error back to client
    return { error: "There was an error. Please try again later." } as ServerActionError;
  }
});
