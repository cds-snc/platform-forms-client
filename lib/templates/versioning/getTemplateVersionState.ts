import { prisma, prismaErrors } from "@gcforms/database";
import { isTemplateVersioningEnabled } from ".";

export async function getTemplateVersionState(formID: string): Promise<{
  isPublished: boolean;
  hasDraftVersion: boolean;
  currentPublishedVersionId?: string | null;
  currentDraftVersionId?: string | null;
} | null> {
  const templateVersioningEnabled = await isTemplateVersioningEnabled();

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
      ? templateVersioningEnabled && Boolean(template.currentDraftVersionId)
      : Boolean(template.currentDraftVersionId),
    currentPublishedVersionId:
      template.isPublished && !templateVersioningEnabled
        ? null
        : template.currentPublishedVersionId,
    currentDraftVersionId:
      template.isPublished && !templateVersioningEnabled ? null : template.currentDraftVersionId,
  };
}
