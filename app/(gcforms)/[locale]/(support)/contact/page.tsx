import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ContactForm } from "./components/client/ContactForm";
import { Success } from "../components/server/Success";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("contactus.title")}`,
  };
}

export default async function Page({
  searchParams: { success },
}: {
  searchParams: { success?: string };
}) {
  return <>{success === undefined ? <ContactForm /> : <Success />}</>;
}
