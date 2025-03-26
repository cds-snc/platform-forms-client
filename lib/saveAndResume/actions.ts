"use server";

import { DownloadProgressHtml } from "@lib/saveAndResume/DownloadProgressHtml";
import { DownloadConfirmHtml } from "@lib/saveAndResume/DownloadConfirmHtml";
import { type HTMLProps } from "@lib/saveAndResume/types";
import { logMessage } from "@lib/logger";

export const generateDownloadHtml = async (props: HTMLProps) => {
  try {
    const formId = props.formId;

    if (!formId) {
      throw new Error("formId is required to generate download progress html");
    }

    const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;

    const { getOrigin } = await import("@lib/origin");
    const host = await getOrigin();
    let html = DownloadProgressHtml({ ...props, host });
    switch (props.type) {
      case "confirm":
        html = DownloadConfirmHtml({ ...props, host });
        break;
      case "progress":
        html = DownloadProgressHtml({ ...props, host });
        break;
      default:
        throw new Error(`Invalid type: ${props.type}`);
    }

    return { data: renderToStaticMarkup(html) };
  } catch (err) {
    logMessage.warn(
      `Error generating HTML due to error: ${(err as Error).message} -  formID: {${props?.formId}}`
    );

    return { data: "", error: (err as Error).message };
  }
};
