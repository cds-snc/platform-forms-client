import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
import { Metadata } from "next";
import { NavigtationFrame } from "./components/server/NavigationFrame";
import { Loader } from "@clientComponents/globals/Loader";

import { UsersList } from "./components/server/UsersList";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-users", { lang: locale });
  return {
    title: `${t("accounts")}`,
  };
}

export default async function Page({
  params: { locale },
  searchParams: { userState },
}: {
  params: { locale: string };
  searchParams: { userState?: string };
}) {
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);
  const ability = createAbility(session);

  // Can the user view this page
  checkPrivilegesAsBoolean(
    ability,
    [
      { action: "view", subject: { type: "User", object: {} } },
      { action: "view", subject: "Privilege" },
    ],
    { logic: "all", redirect: true }
  );

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
