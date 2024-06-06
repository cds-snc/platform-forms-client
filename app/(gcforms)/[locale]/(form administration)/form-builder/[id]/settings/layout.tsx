import { serverTranslation } from "@i18n";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { authCheckAndThrow } from "@lib/actions";
import { SettingsNavigation } from "./components/SettingsNavigation";

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

  return (
    <>
      <h1>{t("gcFormsSettings")}</h1>
      <SettingsNavigation id={id} />
      <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
        {t("settingsResponseDelivery.beforePublishMessage")}
      </p>
      {children}
    </>
  );
}
