import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { TranslateWithGroups } from "./components/TranslateWithGroups";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page() {
  return <TranslateWithGroups />;
}
