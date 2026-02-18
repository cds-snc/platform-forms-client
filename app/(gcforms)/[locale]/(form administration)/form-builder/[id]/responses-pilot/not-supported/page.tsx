import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { NoFileSystemAccess } from "./NoFileSystemAccess";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;

  const { t } = await serverTranslation("response-api", { lang: locale });
  return {
    title: `${t("section-title")} — ${t("not-supported.title")}`,
  };
}

export default async function Page(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;

  return (
    <div data-locale={locale} data-form-id={id}>
      <NoFileSystemAccess />
    </div>
  );
}
