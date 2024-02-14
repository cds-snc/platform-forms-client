import { serverTranslation } from "@i18n";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { auth } from "@lib/auth";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";

export default async function Layout({
  children,
  params: { locale, id },
}: {
  children: React.ReactNode;
  params: { locale: string; id: string };
}) {
  const { t } = await serverTranslation("form-builder", { lang: locale });

  const session = await auth();

  if (!session) {
    return <LoggedOutTab tabName={LoggedOutTabName.PUBLISH} />;
  }

  return (
    <>
      <h1>{t("gcFormsSettings")}</h1>
      <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
        {t("settingsResponseDelivery.beforePublishMessage")}
      </p>
      <SettingsNavigation id={id} />
      {children}
    </>
  );
}
