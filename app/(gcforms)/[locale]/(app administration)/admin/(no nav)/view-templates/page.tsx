import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";
import { DataView } from "./clientSide";
import { getTemplates } from "./actions";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-templates", { lang: locale });
  return {
    title: `${t("view.title")}`,
  };
}

export default async function Page() {
  await authorization.canManageAllForms().catch(() => {
    authorization.unauthorizedRedirect();
  });

  const templates = await getTemplates();

  return <DataView templates={templates} />;
}
