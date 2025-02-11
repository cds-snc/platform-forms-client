"use server";

import { DownloadProgressHtml, type HTMLProps } from "@lib/saveAndResume/DownloadProgressHtml";
import { logMessage } from "@lib/logger";
import { getOrigin } from "@lib/origin";

export const generateDownloadProgressHtml = async (props: HTMLProps) => {
  try {
    const formId = props.formId;

    if (!formId) {
      throw new Error("formId is required to generate download progress html");
    }

    const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
    const host = await getOrigin();
    const html = DownloadProgressHtml({ ...props, host });
    return { data: renderToStaticMarkup(html) };
  } catch (error) {
    if (error instanceof Error) {
      logMessage.warn(
        `Error generating HTML due to error: ${error.message} -  formID: {${props.formId}}`
      );
    }
    return { data: "", error: (error as Error).message };
  }
};
