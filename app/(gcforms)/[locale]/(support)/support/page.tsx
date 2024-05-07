import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { SupportForm } from "./components/client/SupportForm";
import { Success } from "../components/server/Success";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: t("support.title"),
  };
}

export default async function Page({
  searchParams: { success },
  params: { locale },
}: {
  searchParams: { success?: string };
  params: { locale: string };
}) {
  return <>{success === undefined ? <SupportForm /> : <Success lang={locale} />}</>;
}
