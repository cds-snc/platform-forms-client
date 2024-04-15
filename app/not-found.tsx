import React from "react";
import { serverTranslation } from "@i18n";

import { Metadata } from "next";

import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";

import { Fip } from "@clientComponents/globals/Fip";
import { Footer } from "@serverComponents/globals/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation("error");
  return {
    title: t("404.title"),
  };
}

export default async function NotFound() {
  const { t } = await serverTranslation(["error"]);
  return (
    <div className="flex h-full flex-col">
      <header>
        <Fip />
      </header>
      <div id="page-container">
        <main id="content">
          <div className="mt-10">
            <ErrorPanel headingTag="h1" title={t("404.title")}>
              <p>{t("404.body")}</p>
            </ErrorPanel>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
