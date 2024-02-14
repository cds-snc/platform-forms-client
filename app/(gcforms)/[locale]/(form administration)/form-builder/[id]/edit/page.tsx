import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { EditNavigation } from "@clientComponents/form-builder/app";
import { Edit } from "@clientComponents/form-builder/app/edit";

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
      <Edit />
    </>
  );
}
