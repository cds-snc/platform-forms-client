import { Start } from "@clientComponents/form-builder/app/Start";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";
import { FullWidthLayout } from "@clientComponents/globals/layouts/FullWidthLayout";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["common", "form-builder", "form-closed"], {
    lang: locale,
  });
  return {
    title: `${t("gcFormsStart")} — ${t("gcForms")}`,
  };
}

export default async function Page(params: { locale: string }) {
  return (
    <FormBuilderInitializer locale={params.locale} hideLeftNav>
      <FullWidthLayout context="default">
        <Start />
      </FullWidthLayout>
    </FormBuilderInitializer>
  );
}
