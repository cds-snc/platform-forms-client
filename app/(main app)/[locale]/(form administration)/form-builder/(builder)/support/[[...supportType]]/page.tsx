import { notFound } from "next/navigation";
import { ClientSide } from "./clientSide";
import { serverTranslation } from "@i18n";
import DefaultLayout from "@clientComponents/globals/layouts/DefaultLayout";

import { Metadata } from "next";

export async function generateMetadata({
  params: { supportType, locale },
}: {
  params: { supportType: string[]; locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  const support = supportType ? supportType[0] : "";
  return {
    title: support ? `${t("contactus.title")}` : t("support.title"),
  };
}

export default async function Page({
  params: { supportType },
}: {
  params: { supportType: string[] | undefined };
}) {
  // For any URLs other than /support and /support/contactus, redirect the user to the 404 page
  if (supportType !== undefined && supportType[0] !== "contactus") {
    notFound();
  }

  return (
    <DefaultLayout showLanguageToggle>
      <ClientSide supportType={supportType ? supportType[0] : ""} />
    </DefaultLayout>
  );
}
