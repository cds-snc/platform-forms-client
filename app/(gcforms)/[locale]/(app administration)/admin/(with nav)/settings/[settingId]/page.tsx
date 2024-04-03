import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
import { Metadata } from "next";
import { ManageSettingForm } from "../components/server/ManageSettingForm";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { redirect } from "next/navigation";

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
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);
  const ability = createAbility(session);

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
