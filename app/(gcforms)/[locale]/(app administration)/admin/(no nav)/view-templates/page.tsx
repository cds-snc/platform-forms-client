import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
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
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(
    user.ability,
    [
      { action: "view", subject: "FormRecord" },
      { action: "update", subject: "FormRecord" },
    ],
    { logic: "one", redirect: true }
  );

  const templates = (await getAllTemplates(user.ability, user.id)).map((template) => {
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
