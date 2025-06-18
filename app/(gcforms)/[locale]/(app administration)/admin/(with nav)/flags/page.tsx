import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";
import { Metadata } from "next";
import { FlagList } from "./components/server/FlagList";
import { UserList } from "./components/server/UserList";
import { Loader } from "@clientComponents/globals/Loader";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-flags", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default AuthenticatedPage([authorization.canAccessFlags], async () => {
  const { t } = await serverTranslation("admin-flags");

  return (
    <>
      <h1 className="mb-10 border-0">{t("title")}</h1>
      <p className="pb-8">{t("subTitle")}</p>
      <Suspense fallback={<Loader />}>
        <FlagList />
      </Suspense>
      <h1 className="mb-10 mt-10 border-0">User Specific Feature Flag Control</h1>
      <p className="pb-8">
        This setting overrides Feature Flag status, and will provide a specific user access to a
        feature.
      </p>
      <Suspense fallback={<Loader />}>
        <UserList />
      </Suspense>
    </>
  );
});
