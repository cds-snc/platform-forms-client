import { serverTranslation } from "@i18n";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { ManageSettingForm } from "../components/server/ManageSettingForm";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { redirect } from "next/navigation";
import { authCheck } from "@lib/actions";
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-settings", { lang: locale });
  return {
    title: `${t("title-update")}`,
  };
}

export default async function Page({
  params: { settingId, locale },
}: {
  params: { settingId: string; locale: string };
}) {
  const { ability } = await authCheck().catch(() => {
    redirect(`/${locale}/auth/login`);
  });

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
