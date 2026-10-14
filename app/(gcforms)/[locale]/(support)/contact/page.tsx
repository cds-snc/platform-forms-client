import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ContactForm } from "./components/client/ContactForm";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("contactus.title")}`,
  };
}

export default async function Page() {
  return <ContactForm />;
}
