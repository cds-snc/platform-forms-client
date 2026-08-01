import type React from "react";
import type { FormElement, FormElementTypes, Response } from "@lib/types";
import type { FormElementWithIndex, Language } from "@lib/types/form-builder-types";
import type { FormItem } from "@clientComponents/forms/Review/helpers";

export interface ViewerProps {
  element: FormElement;
  language: Language;
}

export interface BuilderProps {
  item: FormElementWithIndex;
  // Defined when the element is a sub-element inside a dynamicRow -- Note: needs testing
  elIndex?: number;
  formId?: string;
}

export interface MoreDialogProps {
  item: FormElement;
  setItem: (item: FormElement) => void;
}

export interface ReviewProps {
  formItem: FormItem;
  language: Language;
}

/**
 * A FormElementPlugin is the single source of truth for one form element type.
 *
 * To add a new element type:
 *   1. Add the type to `FormElementTypes` in `packages/types`.
 *   2. Create `lib/form-elements/<type>/index.ts` implementing this interface.
 *   3. Register it in `lib/form-elements/registry.ts`.
 *   4. Keep the legacy case in `_buildForm` and `SelectedElement` until the flag is retired. (TEMP)
 */
export interface FormElementPlugin {
  // ------- Identity -------

  type: FormElementTypes;

  BuilderIcon: React.ComponentType;

  // i18n key within the form-builder namespace
  builderLabelKey: string;

  // Shown in the "Add element" dialog
  BuilderDescription: React.ComponentType;
  group: "basic" | "preset" | "other";

  // When set, element is hidden in the picker unless this FeatureFlags key is enabled
  betaFlag?: string;
  adminOnly?: boolean;

  // ------- Rendering -------

  // Renders the element inside the live form filler. Must be a client component
  ViewerComponent: React.ComponentType<ViewerProps>;

  // Renders the editing panel in the form builder. Must be a client component
  BuilderComponent: React.ComponentType<BuilderProps>;

  // Optional: renders element-specific settings in the "More" dialog
  MoreDialogComponent?: React.ComponentType<MoreDialogProps>;

  // Optional: renders the answer in the form review step; falls back to FormItemFactory switch if absent
  ReviewComponent?: React.ComponentType<ReviewProps>;

  // -------  Data -------

  defaultProperties: Partial<FormElement["properties"]>;

  // Initial Formik value for a blank element of this type
  initialValue: Response | (() => Response);

  // Optional: serialises a raw string answer for all download formats (CSV, HTML row/col/aggregated)
  formatResponse?: (rawAnswer: string) => string;

  // Set true to hide title/description translation fields in TranslateWithGroups
  noTitleTranslation?: boolean;
}
