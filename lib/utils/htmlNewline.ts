import { FormItem } from "@clientComponents/forms/Review/helpers";
import { Answer } from "@lib/responseDownloadFormats/types";

export const newLineToHtml = (html: FormItem["values"] | Answer[][]): string => {
  if (!html) {
    return "-";
  }

  if (typeof html !== "string") {
    return String(html);
  }

  return html.replace(/\n/g, "<br />");
};
