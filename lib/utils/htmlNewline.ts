import { FormItem } from "@clientComponents/forms/Review/helpers";

export const htmlNewline = (html: FormItem["values"]): string => {
  if (!html) {
    return "-";
  }

  if (typeof html !== "string") {
    return String(html);
  }

  return html.replace(/\n/g, "<br />");
};
