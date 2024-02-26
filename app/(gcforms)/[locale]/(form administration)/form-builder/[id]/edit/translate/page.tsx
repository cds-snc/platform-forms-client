import { serverTranslation } from "@i18n";
import { EditNavigation } from "@clientComponents/form-builder/app";
import { Translate } from "app/(gcforms)/[locale]/(form administration)/form-builder/[id]/edit/translate/components";
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

export default async function Page({ params: { id } }: { params: { id: string } }) {
  return (
    <>
      <EditNavigation id={id} />
      <Translate />
    </>
  );
}
