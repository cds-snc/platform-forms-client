import { serverTranslation } from "@i18n";
import { ResponseDelivery } from "@clientComponents/form-builder/app";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";

import { Metadata } from "next";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsSettings")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const { t } = await serverTranslation("form-builder", { lang: locale });

  return (
    <>
      <h1>{t("gcFormsSettings")}</h1>
      <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
        {t("settingsResponseDelivery.beforePublishMessage")}
      </p>
      <SettingsNavigation id={id} />
      <Suspense fallback={<Loader />}>
        <ResponseDelivery />
      </Suspense>
    </>
  );
}
