import { serverTranslation } from "@i18n";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { authCheckAndThrow } from "@lib/actions";
import { SettingsNavigation } from "./components/SettingsNavigation";
import { WaitForId } from "./components/WaitForId";
import { Language } from "@lib/types/form-builder-types";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;

  const { children } = props;

  const { t } = await serverTranslation("form-builder", { lang: locale });

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

  if (!session) {
    return <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />;
  }

  if (id === "0000") {
    // Handle case where a template may be saving but the id is not available yet
    // see: https://github.com/cds-snc/platform-forms-client/issues/5470#issuecomment-2844798581
    return <WaitForId locale={locale as Language} path="settings" />;
  }

  return (
    <>
      <h1>{t("gcFormsSettings")}</h1>
      <SettingsNavigation id={id} />
      {children}
    </>
  );
}
