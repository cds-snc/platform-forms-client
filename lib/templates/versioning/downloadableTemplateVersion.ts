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
  id?: string;
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
