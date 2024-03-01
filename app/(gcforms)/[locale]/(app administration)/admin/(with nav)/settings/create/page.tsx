import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { ManageSettingForm } from "../components/server/ManageSettingForm";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-settings", { lang: locale });
  return {
    title: `${t("title-create")}`, //TODO
  };
}

export default async function Page() {
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(user.ability, [{ action: "create", subject: "Setting" }], {
    redirect: true,
  });

  const { t } = await serverTranslation("admin-settings");

  return (
    <>
      <h1 className="border-0 mb-10">{t("title-create")}</h1>
      <ManageSettingForm canManageSettings={true} />
    </>
  );
}
