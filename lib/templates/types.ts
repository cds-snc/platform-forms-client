import { ClosedDetails, FormProperties, SecurityAttribute } from "../types";

export const UpdateTemplateAction = {
  General: "general",
  ClosedData: "closedData",
  FormBranding: "formBranding",
  FormPurpose: "formPurpose",
  FormSaveAndResume: "formSaveAndResume",
  IsPublished: "isPublished",
  SecurityAttribute: "securityAttribute",
} as const;

export type UpdateTemplateAction = (typeof UpdateTemplateAction)[keyof typeof UpdateTemplateAction];

export type UpdateTemplateCommand =
  | GeneralUpdateTemplateCommand
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

export type GeneralUpdateTemplateCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.General;
  formConfig: FormProperties;
  name?: string;
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
