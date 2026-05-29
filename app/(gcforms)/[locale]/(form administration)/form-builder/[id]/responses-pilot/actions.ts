"use server";

import { getTemplateForResponseDownload } from "@lib/templates";
import type { FormProperties } from "@lib/types";

export const getResponseTemplateForVersion = async (
  formId: string,
  templateVersionId?: string
): Promise<FormProperties | null> => {
  const template = await getTemplateForResponseDownload(formId, templateVersionId);

  return template?.form ?? null;
};
