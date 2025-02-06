"use server";

import { DownloadProgressHtml, type HTMLProps } from "./html/DownloadProgressHtml";

const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;

export const generateDownloadProgressHtml = async (props: HTMLProps) => {
  try {
    return { data: renderToStaticMarkup(DownloadProgressHtml(props)) };
  } catch (error) {
    return { data: "", error: (error as Error).message };
  }
};
