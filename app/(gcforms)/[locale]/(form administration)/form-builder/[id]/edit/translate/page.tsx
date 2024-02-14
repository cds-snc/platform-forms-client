import { serverTranslation } from "@i18n";
import { EditNavigation } from "@clientComponents/form-builder/app";
import { Translate } from "@clientComponents/form-builder/app/translate";
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
