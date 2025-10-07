import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Client } from "./client";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["common", "api-integration"], {
    lang: locale,
  });
  return {
    title: `${t("title")}`,
  };
}

export default async function Page() {
  return <Client />;
}
