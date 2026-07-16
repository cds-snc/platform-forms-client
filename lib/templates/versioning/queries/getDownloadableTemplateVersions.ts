import { prisma, prismaErrors } from "@gcforms/database";
import { TEMPLATE_VERSION_STATUS } from "../internal/types";
import {
  DownloadableTemplateVersionsInput,
  DownloadableTemplateVersion,
} from "../downloadableTemplateVersion";
import { formatDownloadableTemplateVersions } from "@lib/utils/formatDownloadableTemplateVersions";

export async function getDownloadableTemplateVersions(
  formID: string
): Promise<DownloadableTemplateVersionsInput | null> {
  const template = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        isPublished: true,
        currentDraftVersionId: true,
        currentPublishedVersionId: true,
        currentDraftVersion: {
          select: {
            id: true,
            versionNumber: true,
          },
        },
        currentPublishedVersion: {
          select: {
            id: true,
            versionNumber: true,
          },
        },
        versions: {
          where: {
            status: {
              in: [TEMPLATE_VERSION_STATUS.PUBLISHED, TEMPLATE_VERSION_STATUS.SUPERSEDED],
            },
          },
          select: {
            id: true,
            versionNumber: true,
          },
          orderBy: {
            versionNumber: "desc",
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) {
    return null;
  }

  return template;
}

export async function getFormattedDownloadableTemplateVersions(
  formID: string
): Promise<DownloadableTemplateVersion[]> {
  const template = await getDownloadableTemplateVersions(formID);

  if (!template) {
    return [];
  }

  return formatDownloadableTemplateVersions(template);
}
