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
  formConfig: FormProperties;
};
