import React from "react";
import { serverTranslation } from "@i18n";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { Metadata } from "next";
import { authCheckAndRedirect } from "@lib/actions";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-login", { lang: locale });
  return {
    title: `${t("unauthorized.title")}`,
  };
}

export default async function Page() {
  const { t } = await serverTranslation("admin-login");
  await authCheckAndRedirect();
  return (
    <div className="mt-10">
      <ErrorPanel headingTag="h1" title={t("unauthorized.title")}>
        <p>{t("unauthorized.detail")}</p>
      </ErrorPanel>
    </div>
  );
}
