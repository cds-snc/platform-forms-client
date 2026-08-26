"use server";
import { notFound } from "next/navigation";
import { logMessage } from "./logger";
const headlessCMS = process.env.HEADLESS_CMS_API;

interface CMSPageInfo {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  lang: string;
  id_en: number;
  id_fr: number;
  slug_en: string;
  slug_fr: string;
  slug: string;
  [key: string]: unknown;
}

if (!headlessCMS) {
  throw new Error("SERVER ERROR - No Headless CMS API is configured");
}

const headlessEndpoint = headlessCMS + "/wp-json/wp/v2/pages/?per_page=100";

const inMemCache = new Map<string, CMSPageInfo>();
let lastFetchTime = "";

export const getWPPage = async (pageName: string, language: string) => {
  // Fetch every 10 minutes

  let newData = false;

  const pages: CMSPageInfo[] = await fetch(headlessEndpoint, {
    next: {
      revalidate: 60,
    },
  }).then((res) => {
    const responseDate = res.headers.get("DATE");
    logMessage.debug(`last fetched: ${lastFetchTime} vs current fetch time: ${responseDate}`);
    if (responseDate !== lastFetchTime) {
      newData = true;
      lastFetchTime = responseDate ?? "";
    }

    return res.json();
  });

  if (newData) {
    logMessage.debug("New data fetched from CMS");
    pages.forEach((page) => {
      inMemCache.set(`${page.slug}-${page.lang}`, {
        id: page.id,
        title: {
          rendered: page.title.rendered,
        },
        content: {
          rendered: page.content.rendered,
        },
        lang: page.lang,
        id_en: page.id_en,
        id_fr: page.id_fr,
        slug_en: page.slug_en,
        slug_fr: page.slug_fr,
        slug: page.slug,
      });
    });
  }

  const requestedPage = inMemCache.get(`${pageName}-${language}`);

  if (!requestedPage) {
    notFound();
  }
  return requestedPage;
};
