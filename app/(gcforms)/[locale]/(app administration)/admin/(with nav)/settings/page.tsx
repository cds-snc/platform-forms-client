import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";
import { Settings } from "./components/server/Settings";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { AuthenticatedPage } from "@lib/pages/auth";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-settings", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default AuthenticatedPage([authorization.canAccessSettings], async () => {
  const { t } = await serverTranslation("admin-settings");

  return (
    <>
      <h1 className="mb-10 border-0">{t("title")}</h1>
      <Suspense fallback={<Loader />}>
        <Settings />
      </Suspense>
    </>
  );
});
