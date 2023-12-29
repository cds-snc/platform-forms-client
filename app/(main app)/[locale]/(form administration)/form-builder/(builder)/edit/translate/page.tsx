import { serverTranslation } from "@i18n";
import { EditNavigation } from "@clientComponents/form-builder/app";
import { Translate } from "@clientComponents/form-builder/app/translate";
import { Metadata } from "next";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder");
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <FormBuilderInitializer locale={locale}>
      <EditNavigation />
      <Translate />
    </FormBuilderInitializer>
  );
}
