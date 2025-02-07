"use server";

import { DownloadProgressHtml, type HTMLProps } from "@lib/saveAndResume/DownloadProgressHtml";

import { getOrigin } from "@lib/origin";

export const generateDownloadProgressHtml = async (props: HTMLProps) => {
  try {
    const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
    const host = await getOrigin();
    const html = DownloadProgressHtml({ ...props, host });
    return { data: renderToStaticMarkup(html) };
  } catch (error) {
    return { data: "", error: (error as Error).message };
  }
};
