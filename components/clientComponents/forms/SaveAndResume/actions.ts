"use server";

import { DownloadProgressHtml, type HTMLProps } from "@lib/saveAndResume/DownloadProgressHtml";

import { getOrigin } from "@lib/origin";

export const generateDownloadProgressHtml = async (props: HTMLProps) => {
  try {
    const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
    const host = await getOrigin();
    return { data: renderToStaticMarkup(DownloadProgressHtml({ ...props, host })) };
  } catch (error) {
    return { data: "", error: (error as Error).message };
  }
};
