import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";
import { Metadata } from "next";
import { FlagList } from "./components/server/FlagList";
import { UserList } from "./components/server/UserList";
import { Loader } from "@clientComponents/globals/Loader";
import { getAllUsersWithFeatures } from "@root/lib/userFeatureFlags";
import { syncUserFeatureFlagsToRedis } from "@root/lib/cache/userFeatureFlagsCache";

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

  // Get and sync user feature flags for all users
  const usersWithFeatures = await getAllUsersWithFeatures();
  await syncUserFeatureFlagsToRedis(usersWithFeatures);

  return (
    <>
      <h1 className="mb-10 border-0">{t("title")}</h1>
      <p className="pb-8">{t("subTitle")}</p>
      <Suspense fallback={<Loader />}>
        <FlagList />
      </Suspense>
      <h1 className="my-10 border-0">{t("userFlagHeader")}</h1>
      <p className="pb-8">{t("userFlagSubHeader")}</p>
      <Suspense fallback={<Loader />}>
        <UserList usersWithFeatures={usersWithFeatures} />
      </Suspense>
    </>
  );
});
