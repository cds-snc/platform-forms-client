import { ClosedDetails, FormProperties, SecurityAttribute } from "../types";

export const UpdateTemplateAction = {
  Name: "name",
  FormConfig: "formConfig",
  ClosedData: "closedData",
  FormBranding: "formBranding",
  FormPurpose: "formPurpose",
  FormSaveAndResume: "formSaveAndResume",
  IsPublished: "isPublished",
  SecurityAttribute: "securityAttribute",
} as const;

export type UpdateTemplateAction = (typeof UpdateTemplateAction)[keyof typeof UpdateTemplateAction];

export type UpdateTemplateCommand =
  | UpdateFormConfigCommand
  | UpdateNameCommand
  | UpdateClosedDataCommand
  | UpdateFormBrandingCommand
  | UpdateFormPurposeCommand
  | UpdateFormSaveAndResumeCommand
  | UpdateIsPublishedCommand
  | UpdateSecurityAttributeCommand;

type BaseUpdateCommand = {
  formId: string;
  action: UpdateTemplateAction;
};

export type UpdateNameCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.Name;
  name: string;
};

export type UpdateFormConfigCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.FormConfig;
  formConfig: FormProperties;
};

export type UpdateClosedDataCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.ClosedData;
  closingDate: string | null;
  closedDetails?: ClosedDetails;
};

export type UpdateFormBrandingCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.FormBranding;
  formConfig: FormProperties;
};

export type UpdateFormPurposeCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.FormPurpose;
  formPurpose: string;
};

export type UpdateFormSaveAndResumeCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.FormSaveAndResume;
  saveAndResume: boolean;
};

export type UpdateIsPublishedCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.IsPublished;
  isPublished: boolean;
  publishReason: string;
  publishFormType: string;
  publishDescription: string;
};

export type UpdateSecurityAttributeCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.SecurityAttribute;
  securityAttribute: SecurityAttribute;
};

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
