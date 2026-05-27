import { type ComponentType, type ReactElement } from "react";
import { type FormItem } from "@clientComponents/forms/Review/helpers";
import { FormElement } from "@lib/types";
import { type Language, type ElementOption } from "@lib/types/form-builder-types";

type ElementOptionGroup = {
  id: string;
  value: string;
};

export type BuildAddElementOptionContext = {
  t: (key: string) => string;
  groups: Record<string, ElementOptionGroup>;
};

export type IncludeIfContext = {
  getFlag: (flag: string) => boolean;
  isAdminUser: boolean;
  hasApiKeyId: boolean;
};

export type RenderPublicContext = {
  element: FormElement;
  lang: string;
};

export type RenderReviewContext = {
  formItem: FormItem;
  language: Language;
};

export type RenderBuilderPreviewContext = {
  item: FormElement;
};

export type RenderPanelBodyActionContext = {
  item: FormElement;
  t: (key: string) => string;
  openMoreDialog: () => void;
};

export type EditOptionsProps = {
  item: FormElement;
  setItem: (item: FormElement) => void;
  setIsValid?: (isValid: boolean) => void;
};

export type ClientElementDefinition = {
  includeIf?: (context: IncludeIfContext) => boolean;
  buildAddElementOption?: (context: BuildAddElementOptionContext) => ElementOption;
  renderPublic?: (context: RenderPublicContext) => ReactElement;
  renderReview?: (context: RenderReviewContext) => ReactElement;
  renderBuilderPreview?: (context: RenderBuilderPreviewContext) => ReactElement;
  renderPanelBodyAction?: (context: RenderPanelBodyActionContext) => ReactElement;
  EditOptionsComponent?: ComponentType<EditOptionsProps>;
};
