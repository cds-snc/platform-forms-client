import { serverTranslation } from "@i18n";
import { Published } from "@clientComponents/form-builder/app";

import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsPublished")} — ${t("gcForms")}`,
  };
}

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <Published id={id} />;
}
