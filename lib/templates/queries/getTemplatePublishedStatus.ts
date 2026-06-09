import { prisma, prismaErrors } from "@gcforms/database";

export async function getTemplatePublishedStatus(formID: string): Promise<boolean | null> {
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
