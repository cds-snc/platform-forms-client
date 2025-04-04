import React from "react";
import { serverTranslation } from "@i18n";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { Metadata } from "next";
import { AuthenticatedPage } from "@lib/pages/auth";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-login", { lang: locale });
  return {
    title: `${t("unauthorized.title")}`,
  };
}

export default AuthenticatedPage(async () => {
  const { t } = await serverTranslation("admin-login");

  return (
    <div className="mt-10">
      <ErrorPanel headingTag="h1" title={t("unauthorized.title")}>
        <p>{t("unauthorized.detail")}</p>
      </ErrorPanel>
    </div>
  );
});
