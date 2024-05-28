import { serverTranslation } from "@i18n";
import { authCheckAndRedirect } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { DataView } from "./clientSide";
import { getAllTemplates } from "@lib/templates";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-templates", { lang: locale });
  return {
    title: `${t("view.title")}`,
  };
}

export default async function Page() {
  const { ability } = await authCheckAndRedirect();

  checkPrivilegesAsBoolean(
    ability,
    [
      { action: "view", subject: "FormRecord" },
      { action: "update", subject: "FormRecord" },
    ],
    { logic: "one", redirect: true }
  );

  const templates = (await getAllTemplates(ability)).map((template) => {
    const {
      id,
      form: { titleEn, titleFr },
      isPublished,
    } = template;
    return {
      id,
      titleEn,
      titleFr,
      isPublished,
    };
  });

  return <DataView templates={templates} />;
}
