export const FORM_BUILDER_EDITOR_LANE_CLASS = "w-full max-w-[800px]";
export const FORM_BUILDER_TRANSLATE_EDITOR_LANE_CLASS =
  "w-[clamp(1200px,calc(100vw-32rem),1400px)]";

const FORM_BUILDER_EDIT_OPEN_MIN_WIDTH_CLASS = "min-w-[min(42rem,100%)]";
const FORM_BUILDER_EDIT_CLOSED_MIN_WIDTH_CLASS = "min-w-[min(48rem,100%)]";

export const getFormBuilderContentMinWidthClass = (open: boolean) =>
  open ? FORM_BUILDER_EDIT_OPEN_MIN_WIDTH_CLASS : FORM_BUILDER_EDIT_CLOSED_MIN_WIDTH_CLASS;
