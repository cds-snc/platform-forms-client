import { renderToStaticMarkup } from "react-dom/server.browser";

import { DownloadProgressHtml } from "@lib/saveAndResume/DownloadProgressHtml";
import { DownloadConfirmHtml } from "@lib/saveAndResume/DownloadConfirmHtml";
import { type HTMLProps } from "@lib/saveAndResume/types";
import { logMessage } from "@lib/logger";

export const generateResponseProgressHtml = async (props: HTMLProps) => {
  try {
    const formId = props.formId;

    if (!formId) {
      throw new Error("formId is required to generate download progress html");
    }

    const host = typeof window !== "undefined" ? window.location.origin : props.host;

    const html =
      props.type === "confirm"
        ? DownloadConfirmHtml({ ...props, host })
        : DownloadProgressHtml({ ...props, host });

    return { data: renderToStaticMarkup(html) };
  } catch (err) {
    logMessage.warn(
      `Error generating HTML in client due to error: ${(err as Error).message} - formID: {${props?.formId}}`
    );

    return { data: "", error: (err as Error).message };
  }
};
