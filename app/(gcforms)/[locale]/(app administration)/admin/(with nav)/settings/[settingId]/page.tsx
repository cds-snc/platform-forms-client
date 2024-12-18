import { serverTranslation } from "@i18n";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { ManageSettingForm } from "../components/server/ManageSettingForm";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { authCheckAndRedirect } from "@lib/actions";
export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-settings", { lang: locale });
  return {
    title: `${t("title-update")}`,
  };
}

export default async function Page(props: { params: Promise<{ settingId: string }> }) {
  const params = await props.params;

  const { settingId } = params;

  const { ability } = await authCheckAndRedirect();

  checkPrivilegesAsBoolean(ability, [{ action: "update", subject: "Setting" }], {
    redirect: true,
  });

  const { t } = await serverTranslation("admin-settings");

  return (
    <>
      <h1 className="border-0 mb-10">{t("title-update")}</h1>
      <Suspense fallback={<Loader />}>
        <ManageSettingForm settingId={settingId} />
      </Suspense>
    </>
  );
}
