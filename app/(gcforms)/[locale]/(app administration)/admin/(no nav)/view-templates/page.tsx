import { serverTranslation } from "@i18n";
import { authCheckAndRedirect } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
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
  const { ability } = await authCheckAndRedirect();

  checkPrivilegesAsBoolean(ability, [{ action: "update", subject: "FormRecord" }], {
    redirect: true,
  });

  const templates = await getTemplates();

  return <DataView templates={templates} />;
}
