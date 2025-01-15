import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";
import { Metadata } from "next";
import { ManageSettingForm } from "../components/server/ManageSettingForm";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-settings", { lang: locale });
  return {
    title: `${t("title-create")}`,
  };
}

export default AuthenticatedPage([authorization.canManageSettings], async () => {
  const { t } = await serverTranslation("admin-settings");

  return (
    <>
      <h1 className="mb-10 border-0">{t("title-create")}</h1>
      <ManageSettingForm />
    </>
  );
});
