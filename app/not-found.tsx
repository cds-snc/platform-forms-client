import React from "react";
import { serverTranslation } from "@i18n";

import { Metadata } from "next";

import { ErrorPanel } from "@appComponents/globals/ErrorPanel";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation("error");
  return {
    title: t("404.title"),
  };
}

const PageNotFound = async () => {
  const { t } = await serverTranslation(["error"]);
  return (
    <div className="mt-10">
      <ErrorPanel headingTag="h1" title={t("404.title")}>
        <p>{t("404.body")}</p>
      </ErrorPanel>
    </div>
  );
};

export default PageNotFound;
