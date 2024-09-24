import { serverTranslation } from "@i18n";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { authCheckAndThrow } from "@lib/actions";
import { SettingsNavigation } from "./components/SettingsNavigation";
import { FeatureFlagsProvider } from "@lib/hooks/useFeatureFlags";
import { getSomeFlags } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/flags";

export default async function Layout({
  children,
  params: { locale, id },
}: {
  children: React.ReactNode;
  params: { locale: string; id: string };
}) {
  const { t } = await serverTranslation("form-builder", { lang: locale });

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

  if (!session) {
    return <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />;
  }

  const featureFlags = await getSomeFlags([
    FeatureFlags.experimentalBlocks,
    FeatureFlags.zitadelAuth,
    FeatureFlags.conditionalLogic,
    FeatureFlags.addressComplete,
  ]);

  return (
    <FeatureFlagsProvider featureFlags={featureFlags}>
      <h1>{t("gcFormsSettings")}</h1>
      <SettingsNavigation id={id} />
      <p className="mb-10 inline-block bg-purple-200 p-3 text-sm font-bold">
        {t("settingsResponseDelivery.beforePublishMessage")}
      </p>
      {children}
    </FeatureFlagsProvider>
  );
}
