import { prisma, prismaErrors } from "@gcforms/database";
import { isTemplateVersioningEnabled } from "../versioning/internal";
import { getTemplatePublishedStatus as getTemplatePublishedStatusVersioningEnabled } from "../versioning/queries/getTemplatePublishedStatus";

export async function getTemplatePublishedStatus(formID: string): Promise<boolean | null> {
  if (await isTemplateVersioningEnabled()) {
    return getTemplatePublishedStatusVersioningEnabled(formID);
  }
  const template = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        isPublished: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) return null;

  return template.isPublished;
}
