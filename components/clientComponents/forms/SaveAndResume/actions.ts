"use server";

import { DownloadProgressHtml, type HTMLProps } from "@lib/saveAndResume/DownloadProgressHtml";

export const generateDownloadProgressHtml = async (props: HTMLProps) => {
  try {
    const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;

    return { data: renderToStaticMarkup(DownloadProgressHtml(props)) };
  } catch (error) {
    return { data: "", error: (error as Error).message };
  }
};
