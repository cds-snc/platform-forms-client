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
  async ({ params, searchParams }) => {
    const { userState } = await searchParams;

    if (Array.isArray(userState)) {
      throw new Error("Invalid user state, expected a string and received an array");
    }

    const { locale } = await params;

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
