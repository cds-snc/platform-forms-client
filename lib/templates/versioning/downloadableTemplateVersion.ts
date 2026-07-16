import { FormProperties } from "@lib/types";

export const DOWNLOADABLE_TEMPLATE_VERSION_LABEL = {
  currentDraft: "currentDraft",
  currentPublished: "currentPublished",
  published: "published",
} as const;

export type DownloadableTemplateVersionLabel =
  (typeof DOWNLOADABLE_TEMPLATE_VERSION_LABEL)[keyof typeof DOWNLOADABLE_TEMPLATE_VERSION_LABEL];

export type DownloadableTemplateVersion = {
  versionNumber: number;
  label: DownloadableTemplateVersionLabel;
  formConfig?: FormProperties;
};

export type DownloadableTemplateVersionsInput = {
  currentDraftVersion?: { id: string; versionNumber: number } | null;
  currentPublishedVersion?: { id: string; versionNumber: number } | null;
  currentDraftVersionId?: string | null;
  currentPublishedVersionId?: string | null;
  versions?: Array<{ id: string; versionNumber: number }> | null;
};

export function formatDownloadableTemplateVersions(
  template: DownloadableTemplateVersionsInput
): DownloadableTemplateVersion[] {
  const downloadableVersions: DownloadableTemplateVersion[] = [];

  if (template.currentDraftVersion) {
    downloadableVersions.push({
      versionNumber: template.currentDraftVersion.versionNumber,
      label: DOWNLOADABLE_TEMPLATE_VERSION_LABEL.currentDraft,
    });
  }

  if (template.currentPublishedVersion) {
    downloadableVersions.push({
      versionNumber: template.currentPublishedVersion.versionNumber,
      label: DOWNLOADABLE_TEMPLATE_VERSION_LABEL.currentPublished,
    });
  }

  const skippedVersionIds = new Set(
    [template.currentDraftVersionId, template.currentPublishedVersionId].filter(Boolean)
  );

  (template.versions || []).forEach((version) => {
    if (skippedVersionIds.has(version.id)) {
      return;
    }

    downloadableVersions.push({
      versionNumber: version.versionNumber,
      label: DOWNLOADABLE_TEMPLATE_VERSION_LABEL.published,
    });
  });

  if (downloadableVersions.length === 0) {
    downloadableVersions.push({
      versionNumber: 1,
      label: DOWNLOADABLE_TEMPLATE_VERSION_LABEL.currentDraft,
    });
  }

  return downloadableVersions.sort((left, right) => right.versionNumber - left.versionNumber);
}
