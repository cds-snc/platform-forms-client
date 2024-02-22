import { Contact } from "./Contact";
import { serverTranslation } from "@i18n";
import DefaultLayout from "@clientComponents/globals/layouts/DefaultLayout";

import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("contactus.title")}`,
  };
}

export default async function Page() {
  return (
    <DefaultLayout showLanguageToggle>
      <Contact />
    </DefaultLayout>
  );
}
