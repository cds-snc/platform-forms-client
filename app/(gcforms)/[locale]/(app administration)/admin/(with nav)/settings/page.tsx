import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
import { Metadata } from "next";
import { Settings } from "./components/server/Settings";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { Messages } from "./components/client/Messages";
import { redirect } from "next/navigation";

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

// Note: the searchParam is used as the language key to display the success or error message
export default async function Page({
  params: { locale },
  searchParams: { success, error },
}: {
  params: { locale: string };
  searchParams: { success?: string; error?: string };
}) {
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login}`);
  const ability = createAbility(session);

  checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "Setting" }], {
    redirect: true,
  });

  const { t } = await serverTranslation("admin-settings");

  return (
    <>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      <Messages success={success} error={error} />
      <Suspense fallback={<Loader />}>
        <Settings />
      </Suspense>
    </>
  );
}
