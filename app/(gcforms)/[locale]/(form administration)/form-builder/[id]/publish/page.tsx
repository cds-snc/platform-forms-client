import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Publish } from "@clientComponents/form-builder/app";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsPublish")} — ${t("gcForms")}`,
  };
}

export default async function Page({ params: { id } }: { params: { id: string } }) {
  return <Publish id={id} />;
}
