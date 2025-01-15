import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";
import { Settings } from "./components/server/Settings";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { Messages } from "./components/client/Messages";
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

// Note: the searchParam is used as the language key to display the success or error message
export default AuthenticatedPage(
  [authorization.canAccessSettings],
  async (props: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ success?: string; error?: string }>;
  }) => {
    const searchParams = await props.searchParams;

    const { success, error } = searchParams;

    const { t } = await serverTranslation("admin-settings");

    return (
      <>
        <h1 className="mb-10 border-0">{t("title")}</h1>
        <Messages success={success} error={error} />
        <Suspense fallback={<Loader />}>
          <Settings />
        </Suspense>
      </>
    );
  }
);
