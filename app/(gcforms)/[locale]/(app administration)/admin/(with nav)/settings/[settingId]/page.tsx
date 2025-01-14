import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";
import { Metadata } from "next";
import { ManageSettingForm } from "../components/server/ManageSettingForm";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";

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

export default AuthenticatedPage([authorization.canManageSettings], async ({ params }) => {
  const { settingId } = await params;
  if (Array.isArray(settingId)) {
    throw new Error("Invalid setting id");
  }

  await authorization.canManageSettings().catch(() => authorization.unauthorizedRedirect());

  const { t } = await serverTranslation("admin-settings");

  return (
    <>
      <h1 className="mb-10 border-0">{t("title-update")}</h1>
      <Suspense fallback={<Loader />}>
        <ManageSettingForm settingId={settingId} />
      </Suspense>
    </>
  );
});
