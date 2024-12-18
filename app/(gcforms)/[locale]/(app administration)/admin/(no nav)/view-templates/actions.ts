"use server";

import { getAllTemplates } from "@lib/templates";
import { authCheckAndThrow } from "@lib/actions";
import { FormRecord } from "@lib/types";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getTemplates = async () => {
  const { ability } = await authCheckAndThrow();
  const templates = await getAllTemplates(ability);
  return filterTemplateProperties(templates);
};

export const getLatestPublishedTemplates = async () => {
  const { ability } = await authCheckAndThrow();
  const templates = await getAllTemplates(ability, {
    requestedWhere: { isPublished: true },
    sortByDateUpdated: "desc",
  });
  return filterTemplateProperties(templates);
};

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
