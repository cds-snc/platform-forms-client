import { prisma, prismaErrors } from "@gcforms/database";
import { TEMPLATE_VERSION_STATUS } from "../internal/types";
import {
  DOWNLOADABLE_TEMPLATE_VERSION_LABEL,
  DownloadableTemplateVersion,
} from "../downloadableTemplateVersion";
import { FormProperties } from "@lib/types";

const parseJsonConfig = (raw: unknown): FormProperties => {
  if (typeof raw === "string") {
    return JSON.parse(raw) as FormProperties;
  }

  return raw as FormProperties;
};

export async function getDownloadableTemplateVersions(
  formID: string
): Promise<DownloadableTemplateVersion[]> {
  const template = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        isPublished: true,
        jsonConfig: true,
        currentDraftVersionId: true,
        currentPublishedVersionId: true,
        currentDraftVersion: {
          select: {
            id: true,
            versionNumber: true,
            jsonConfig: true,
          },
        },
        currentPublishedVersion: {
          select: {
            id: true,
            versionNumber: true,
            jsonConfig: true,
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
            jsonConfig: true,
          },
          orderBy: {
            versionNumber: "desc",
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) {
    return [];
  }

  const downloadableVersions: DownloadableTemplateVersion[] = [];

  if (template.currentDraftVersion) {
    downloadableVersions.push({
      versionNumber: template.currentDraftVersion.versionNumber,
      label: DOWNLOADABLE_TEMPLATE_VERSION_LABEL.currentDraft,
      formConfig: parseJsonConfig(template.currentDraftVersion.jsonConfig),
    });
  }

  if (template.currentPublishedVersion) {
    downloadableVersions.push({
      versionNumber: template.currentPublishedVersion.versionNumber,
      label: DOWNLOADABLE_TEMPLATE_VERSION_LABEL.currentPublished,
      formConfig: parseJsonConfig(template.currentPublishedVersion.jsonConfig),
    });
  }

  const skippedVersionIds = new Set(
    [template.currentDraftVersionId, template.currentPublishedVersionId].filter(Boolean)
  );

  template.versions.forEach((version) => {
    if (skippedVersionIds.has(version.id)) {
      return;
    }

    downloadableVersions.push({
      versionNumber: version.versionNumber,
      label: DOWNLOADABLE_TEMPLATE_VERSION_LABEL.published,
      formConfig: parseJsonConfig(version.jsonConfig),
    });
  });

  if (downloadableVersions.length === 0) {
    downloadableVersions.push({
      versionNumber: 1,
      label: DOWNLOADABLE_TEMPLATE_VERSION_LABEL.currentDraft,
      formConfig: parseJsonConfig(template.jsonConfig),
    });
  }

  return downloadableVersions.sort((left, right) => right.versionNumber - left.versionNumber);
}
