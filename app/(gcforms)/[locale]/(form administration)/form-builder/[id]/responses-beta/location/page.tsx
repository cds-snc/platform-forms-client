import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { SelectLocation } from "./SelectLocation";
import { ApiClientGuard } from "../guards/ApiClientGuard";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder-responses", { lang: locale });
  return {
    title: `${t("responsesBeta.pageTitle")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;
  return (
    <ApiClientGuard locale={locale} id={id}>
      <SelectLocation locale={locale} id={id} />
    </ApiClientGuard>
  );
}
