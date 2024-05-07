import { serverTranslation } from "@i18n";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { auth } from "@lib/auth";
import { SettingsNavigation } from "./components/SettingsNavigation";

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
    return <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />;
  }

  return (
    <>
      <h1>{t("gcFormsSettings")}</h1>
      <SettingsNavigation id={id} />
      {children}
    </>
  );
}
