import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";
import { NavigtationFrame } from "./components/server/NavigationFrame";
import { Loader } from "@clientComponents/globals/Loader";

import { UsersList } from "./components/server/UsersList";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-users", { lang: locale });
  return {
    title: `${t("accounts")}`,
  };
}

export default AuthenticatedPage(
  [authorization.canViewAllUsers, authorization.canAccessPrivileges],
  async (props: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ userState?: string }>;
  }) => {
    const searchParams = await props.searchParams;

    const { userState } = searchParams;

    const params = await props.params;

    const { locale } = params;

    const { t } = await serverTranslation("admin-users", { lang: locale });

    return (
      <>
        <h1 className="mb-0 border-0">{t("accounts")}</h1>
        <NavigtationFrame userState={userState}>
          <Suspense key={userState} fallback={<Loader />}>
            <UsersList filter={userState} />
          </Suspense>
        </NavigtationFrame>
      </>
    );
  }
);
