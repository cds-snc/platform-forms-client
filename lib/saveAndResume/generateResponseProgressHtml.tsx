import { renderToStaticMarkup } from "react-dom/server.browser";

import { DownloadProgressHtml } from "@lib/saveAndResume/DownloadProgressHtml";
import { DownloadConfirmHtml } from "@lib/saveAndResume/DownloadConfirmHtml";
import { type HTMLProps } from "@lib/saveAndResume/types";
import { logMessage } from "@lib/logger";

/**
 * Locate the brand logo image element and embed it as a data URI to ensure it is self-contained (does not rely on external resources)
 * @param html The HTML string containing the brand logo image element
 * @returns The HTML string with the brand logo embedded as a data URI if applicable
 * @throws Error if the brand logo is missing or cannot be embedded
 *
 */
export const embedBrandLogoAssets = async (html: string) => {
  const document = new DOMParser().parseFromString(html, "text/html");

  const imageEl = document.querySelector<HTMLImageElement>(".gcds-signature img");

  if (!imageEl) throw new Error("Brand logo is missing from downloaded HTML");
  imageEl.style.maxWidth = "min(400px, 100%)";
  imageEl.style.maxHeight = "80px";

  // The incoming src will look like "/img/branding/some-dept-en.svg"
  const source = imageEl.getAttribute("src");
  if (!source || source.startsWith("data:")) {
    return `<!DOCTYPE html>${document.documentElement.outerHTML}`;
  }

  const logoUrl = new URL(source, window.location.origin);
  if (logoUrl.origin !== window.location.origin) {
    throw new Error("Brand logos must be hosted on the same origin to embed in downloaded HTML");
  }

  // Fetch the brand logo from the server to embed it as a data URI
  const response = await fetch(logoUrl);
  if (!response.ok) {
    throw new Error(`Failed to load brand logo (${response.status} ${response.statusText})`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
  const isSvg = contentType === "image/svg+xml" || logoUrl.pathname.toLowerCase().endsWith(".svg");

  if (isSvg) {
    // Read the SVG content as text to validate and embed it
    const svg = await response.text();
    if (!/<svg(?:\s|>)/i.test(svg)) {
      throw new Error("Downloaded brand logo is not valid SVG");
    }

    const svgDocument = new DOMParser().parseFromString(svg, "image/svg+xml");
    const svgElement = svgDocument.documentElement;
    if (svgDocument.querySelector("parsererror") || svgElement.localName !== "svg") {
      throw new Error("Downloaded brand logo is not valid SVG");
    }

    const viewBox = svgElement
      .getAttribute("viewBox")
      ?.trim()
      .split(/[\s,]+/)
      .map(Number);
    if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
      if (!svgElement.hasAttribute("width")) svgElement.setAttribute("width", String(viewBox[2]));
      if (!svgElement.hasAttribute("height")) svgElement.setAttribute("height", String(viewBox[3]));
    }

    const normalizedSvg = new XMLSerializer().serializeToString(svgElement);
    imageEl.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalizedSvg)}`;
  } else {
    // For non-SVG images, read the image as a Blob and convert it to a data URI
    const logo = await response.blob();
    const mimeType = logo.type || contentType;
    if (!mimeType.startsWith("image/")) {
      throw new Error(`Unsupported brand logo content type: ${mimeType || "unknown"}`);
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Failed to encode brand logo"));
      };
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read brand logo"));
      reader.readAsDataURL(logo);
    });

    imageEl.src = dataUrl;
  }

  return `<!DOCTYPE html>${document.documentElement.outerHTML}`;
};

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

    const markup = renderToStaticMarkup(html);
    return { data: await embedBrandLogoAssets(markup) };
  } catch (err) {
    logMessage.warn(
      `Error generating HTML in client due to error: ${(err as Error).message} - formID: {${props?.formId}}`
    );

    return { data: "", error: (err as Error).message };
  }
};
