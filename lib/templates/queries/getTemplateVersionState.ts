import { prisma, prismaErrors } from "@gcforms/database";

export async function getTemplateVersionState(formID: string): Promise<{
  isPublished: boolean;
  hasDraftVersion: boolean;
  currentPublishedVersionId?: string | null;
  currentDraftVersionId?: string | null;
} | null> {
  const template = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        isPublished: true,
        currentPublishedVersionId: true,
        currentDraftVersionId: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) return null;

  return {
    isPublished: template.isPublished,
    hasDraftVersion: template.isPublished
      ? Boolean(template.currentDraftVersionId)
      : Boolean(template.currentDraftVersionId),
    currentPublishedVersionId: template.currentPublishedVersionId,
    currentDraftVersionId: template.currentDraftVersionId,
  };
}
