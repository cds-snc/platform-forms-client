export const FORM_BUILDER_EDITOR_LANE_CLASS = "w-full max-w-[800px]";
export const FORM_BUILDER_TRANSLATE_EDITOR_LANE_CLASS = "w-full max-w-[56rem]";

const FORM_BUILDER_EDIT_OPEN_MIN_WIDTH_CLASS = "min-w-[min(42rem,100%)]";
const FORM_BUILDER_EDIT_CLOSED_MIN_WIDTH_CLASS = "min-w-[min(48rem,100%)]";
const FORM_BUILDER_TRANSLATE_OPEN_MIN_WIDTH_CLASS = "min-w-[min(1100px,100%)]";
const FORM_BUILDER_TRANSLATE_CLOSED_MIN_WIDTH_CLASS = "min-w-[min(1100px,100%)]";

export const getFormBuilderContentMinWidthClass = (
  open: boolean,
  variant: "edit" | "translate" = "edit"
) => {
  if (variant === "translate") {
    return open
      ? FORM_BUILDER_TRANSLATE_OPEN_MIN_WIDTH_CLASS
      : FORM_BUILDER_TRANSLATE_CLOSED_MIN_WIDTH_CLASS;
  }

  return open ? FORM_BUILDER_EDIT_OPEN_MIN_WIDTH_CLASS : FORM_BUILDER_EDIT_CLOSED_MIN_WIDTH_CLASS;
};
