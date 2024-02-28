import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { Settings } from "./clientSide";
import { getAllAppSettings } from "@lib/appSettings";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-settings", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default async function Page() {
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(user.ability, [{ action: "view", subject: "Setting" }], {
    redirect: true,
  });
  const settings = await getAllAppSettings(user.ability);

  const { t } = await serverTranslation("admin-settings");

  return (
    <>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      <Suspense fallback={<Loader />}>
        <Settings settings={settings} />
      </Suspense>
    </>
  );
}
