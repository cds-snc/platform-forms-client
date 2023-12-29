import { Start } from "@clientComponents/form-builder/app/Start";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation(["common", "form-builder", "form-closed"]);
  return {
    title: `${t("gcFormsStart")} — ${t("gcForms")}`,
  };
}

export default async function Page(params: { locale: string }) {
  return (
    <FormBuilderInitializer locale={params.locale} hideLeftNav>
      <Start />
    </FormBuilderInitializer>
  );
}
