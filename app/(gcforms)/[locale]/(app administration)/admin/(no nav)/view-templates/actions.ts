"use server";

import { getAllTemplates } from "@lib/templates";
import { AuthenticatedAction } from "@lib/actions";
import { FormRecord } from "@lib/types";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getTemplates = AuthenticatedAction(async () => {
  const templates = await getAllTemplates();
  return filterTemplateProperties(templates);
});

export const getLatestPublishedTemplates = AuthenticatedAction(async () => {
  const templates = await getAllTemplates({
    requestedWhere: { isPublished: true },
    sortByDateUpdated: "desc",
  });

  return filterTemplateProperties(templates);
});

// Internal and private functions - won't be converted into server actions

const filterTemplateProperties = (templates: FormRecord[]) => {
  return templates.map((template) => {
    const {
      id,
      form: { titleEn, titleFr },
      isPublished,
      updatedAt,
    } = template;
    return { id, titleEn, titleFr, isPublished, updatedAt };
  });
};
