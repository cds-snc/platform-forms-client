"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDraftVersionForTemplate } from "@lib/templates/mutations/createDraftForTemplate";
import { getTemplateVersionById } from "@lib/templates/queries/getTemplateVersionById";
import { AuthenticatedAction } from "@lib/actions";
import { type FormProperties, type FormRecord } from "@lib/types";

export const createDraftVersion = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      redirectAfter,
      formConfig,
      sourceVersionId,
    }: {
      id: string;
      redirectAfter?: string;
      formConfig?: FormProperties;
      sourceVersionId?: string;
    }
  ): Promise<{
    formRecord: FormRecord | null;
    error?: string;
  }> => {
    let hasError;
    let response: FormRecord | null = null;

    try {
      let sourceConfig = formConfig;
      if (sourceVersionId) {
        const versionRecord = await getTemplateVersionById(formID, sourceVersionId);
        if (!versionRecord?.jsonConfig) {
          throw new Error("Version Not Found");
        }

        sourceConfig =
          typeof versionRecord.jsonConfig === "string"
            ? (JSON.parse(versionRecord.jsonConfig) as FormProperties)
            : (versionRecord.jsonConfig as FormProperties);
      }

      response = await createDraftVersionForTemplate(formID, sourceConfig);

      if (!response) {
        throw new Error(`Unable to create a draft version for ${formID}`);
      }

      revalidatePath(`/form-builder/${formID}`, "layout");
      revalidatePath(`/form-builder/${formID}/published`, "page");
      revalidatePath(`/form-builder/${formID}/publish`, "page");
    } catch (error) {
      hasError = error;
    }

    if (!hasError && redirectAfter) {
      if (!redirectAfter.startsWith("/") || redirectAfter.startsWith("//")) {
        return { formRecord: response, error: "Invalid redirect path" };
      }
      redirect(redirectAfter);
    }

    return { formRecord: response, error: hasError ? (hasError as Error).message : undefined };
  }
);
