import type React from "react";
import type { FormElement, FormElementTypes, Response } from "@lib/types";
import type { FormElementWithIndex, Language } from "@lib/types/form-builder-types";
import type { FormItem } from "@clientComponents/forms/Review/helpers";
import type { FeatureFlags } from "@lib/cache/types";

// ---------------------------------------------------------------------------
// Prop interfaces for the three rendering contexts
// ---------------------------------------------------------------------------

/**
 * Props received by a plugin's ViewerComponent — used when rendering the
 * element inside the live form filler.
 */
export interface ViewerProps {
  element: FormElement;
  language: Language;
}

/**
 * Props received by a plugin's BuilderComponent — used when the element is
 * selected in the form-builder right panel.
 */
export interface BuilderProps {
  item: FormElementWithIndex;
  /** Defined (>= 0) when the element is rendered as a sub-element inside a dynamicRow. */
  elIndex?: number;
  /** The parent form ID — available in the builder context. */
  formId?: string;
}

/**
 * Props received by a plugin's ReviewComponent — used when rendering the
 * element in the form's review / summary page.
 */
export interface ReviewProps {
  formItem: FormItem;
  language: Language;
}

// ---------------------------------------------------------------------------
// The plugin contract
// ---------------------------------------------------------------------------

/**
 * A FormElementPlugin is the single source of truth for one form element type.
 *
 * To add a new element to the application:
 *   1. Add the type string to `FormElementTypes` in `packages/types`.
 *   2. Create `plugins/form-elements/<yourType>/index.ts` implementing this interface.
 *   3. Register it in `plugins/form-elements/registry.ts`.
 *
 * No other files need to change.
 */
export interface FormElementPlugin {
  // ── Identity ──────────────────────────────────────────────────────────────

  /** Matches the corresponding `FormElementTypes` value. */
  type: FormElementTypes;

  // ── Builder palette ───────────────────────────────────────────────────────

  /** Icon displayed in the "Add element" picker dialog. */
  BuilderIcon: React.ComponentType;

  /**
   * i18n key (within the `form-builder` namespace) for the element's display
   * name in the picker dialog.
   */
  builderLabelKey: string;

  /**
   * Component rendered as the preview/description inside the "Add element"
   * dialog. Will be lazy-loaded by the framework.
   */
  BuilderDescription: React.ComponentType;

  /**
   * Picker group this element belongs to. Controls visual grouping in the
   * "Add element" dialog.
   */
  group: "basic" | "preset" | "other";

  /**
   * When set, the element is only shown in the picker when this feature flag
   * is enabled.
   */
  betaFlag?: (typeof FeatureFlags)[keyof typeof FeatureFlags];

  /** When true, the element is only shown to admin users in the picker. */
  adminOnly?: boolean;

  // ── Rendering ─────────────────────────────────────────────────────────────

  /**
   * Renders the interactive element inside the live form filler.
   * Must be a client component.
   */
  ViewerComponent: React.ComponentType<ViewerProps>;

  /**
   * Renders the editing controls in the form-builder right panel when this
   * element is selected.
   * Must be a client component.
   */
  BuilderComponent: React.ComponentType<BuilderProps>;

  /**
   * Renders a read-only summary of the element's response on the review page.
   * Null for elements that should not appear in the review (e.g. richText).
   */
  ReviewComponent: React.ComponentType<ReviewProps> | null;

  // ── Data (no JSX — safe to call from server actions) ─────────────────────

  /**
   * Default `properties` object applied to a newly-created element of this
   * type. Merged with the base defaults in the element factory.
   */
  defaultProperties: Partial<FormElement["properties"]>;

  /**
   * Normalises a raw form response value into the canonical shape expected for
   * storage and downstream processing (used in `normalizeFormResponses`).
   */
  normalize: (value: Response) => Response;

  /**
   * Converts a response value to a human-readable string for CSV / download
   * output.
   */
  toString: (value: Response, language: Language) => string;
}
