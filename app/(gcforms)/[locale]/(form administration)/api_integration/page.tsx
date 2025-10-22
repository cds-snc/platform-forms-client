import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Client, type ClientProps } from "./client";

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

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const format = searchParams?.format || undefined;

  const props: ClientProps = { format: format };
  return <Client {...props} />;
}
