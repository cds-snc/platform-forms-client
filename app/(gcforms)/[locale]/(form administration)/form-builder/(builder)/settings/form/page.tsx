import { serverTranslation } from "@i18n";
import { Settings } from "@clientComponents/form-builder/app";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("branding.heading")}`,
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <FormBuilderInitializer locale={locale}>
      <SettingsNavigation />
      <Settings />
    </FormBuilderInitializer>
  );
}
