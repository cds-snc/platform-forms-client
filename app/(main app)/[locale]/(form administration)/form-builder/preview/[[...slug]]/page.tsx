import { serverTranslation } from "@i18n";
import { ClientSide } from "./clientSide";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <FormBuilderInitializer locale={locale}>
      <ClientSide />
    </FormBuilderInitializer>
  );
}
