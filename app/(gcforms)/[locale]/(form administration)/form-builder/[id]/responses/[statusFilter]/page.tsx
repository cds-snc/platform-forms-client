import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { getAppSetting } from "@lib/appSettings";
import { ClientContainer } from "./components/ClientContainer";
import { authCheckAndThrow } from "@lib/actions";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { VaultStatus } from "@lib/types";
import { redirect } from "next/navigation";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const { t } = await serverTranslation(["form-builder-responses", "form-builder"], {
    lang: locale,
  });
  return {
    title: `${t("responses.title")} — ${t("gcForms")}`,
  };
}

export default async function Page(
  props: {
    params: Promise<{ locale: string; id: string; statusFilter: string }>;
  }
) {
  const params = await props.params;

  const {
    id,
    statusFilter,
    locale
  } = params;

  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
  }));

  const isAuthenticated = session !== null;

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl">
        <LoggedOutTab tabName={LoggedOutTabName.RESPONSES} />
      </div>
    );
  }

  // Redirect to 'new' if the statusFilter is not a valid value
  if (
    !Object.keys(VaultStatus)
      .map((x) => x.toLocaleLowerCase())
      .includes(statusFilter)
  ) {
    redirect(`/${locale}/form-builder/${id}/responses/${VaultStatus.NEW.toLowerCase()}`);
  }

  return (
    <ClientContainer
      responseDownloadLimit={Number(await getAppSetting("responseDownloadLimit"))}
      overdueAfter={Number(await getAppSetting("nagwarePhaseEncouraged"))}
    />
  );
}
