"use server";

import { getAllTemplates } from "@lib/templates";
import { AuthenticatedAction } from "@lib/actions";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getLatestPublishedTemplates = AuthenticatedAction(async () => {
  const templates = await getAllTemplates({
    requestedWhere: { isPublished: true },
    sortByDateUpdated: "desc",
  });

  return templates.map((template) => {
    const {
      id,
      form: { titleEn, titleFr },
      isPublished,
      updatedAt,
    } = template;

    return { id, titleEn, titleFr, isPublished, updatedAt };
  });
});
