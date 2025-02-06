import { serverTranslation } from "@i18n";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { authCheckAndThrow } from "@lib/actions";
import { SettingsNavigation } from "./components/SettingsNavigation";
import { notFound } from "next/navigation";

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
    return notFound();
  }

  return (
    <>
      <h1>{t("gcFormsSettings")}</h1>
      <SettingsNavigation id={id} />
      {children}
    </>
  );
}
