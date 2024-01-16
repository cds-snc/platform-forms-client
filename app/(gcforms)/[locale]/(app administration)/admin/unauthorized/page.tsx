import React from "react";
import { serverTranslation } from "@i18n";
import { ErrorPanel } from "@clientComponents/globals";
import { Metadata } from "next";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";

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

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { t } = await serverTranslation("admin-login");
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }
  return (
    <div className="mt-10">
      <ErrorPanel headingTag="h1" title={t("unauthorized.title")}>
        <p>{t("unauthorized.detail")}</p>
      </ErrorPanel>
    </div>
  );
}
