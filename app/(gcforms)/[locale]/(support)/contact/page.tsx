import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ContactForm } from "./components/client/ContactForm";
import { Success } from "../components/server/Success";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("contactus.title")}`,
  };
}

export default async function Page(
  props: {
    searchParams: Promise<{ success?: string }>;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const searchParams = await props.searchParams;

  const {
    success
  } = searchParams;

  return <>{success === undefined ? <ContactForm /> : <Success lang={locale} />}</>;
}
