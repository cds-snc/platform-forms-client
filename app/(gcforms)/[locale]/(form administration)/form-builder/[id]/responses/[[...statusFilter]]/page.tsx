import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { getAppSetting } from "@lib/appSettings";
import { authCheckAndThrow } from "@lib/actions";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { checkKeyExists } from "@lib/serviceAccount";
import { ResponsesApiContainer } from "./components/ResponsesApiContainer";
import { ResponsesContainer } from "./components/ResponsesContainer";

export enum StatusFilter {
  NEW = "new",
  DOWNLOADED = "downloaded",
  CONFIRMED = "confirmed",
  PROBLEM = "problem",
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["form-builder-responses", "form-builder"], {
    lang: locale,
  });
  return {
    title: `${t("responses.title")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { id, statusFilter },
}: {
  params: { id: string; statusFilter: string };
}) {
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

  const hasApiKeyId = await checkKeyExists(id);

  // if statusFilter is invalid, default to "new"
  if (!Object.keys(StatusFilter).includes(statusFilter)) {
    statusFilter = StatusFilter.NEW;
  }

  // Redirect to 'new' if the statusFilter is not a valid value
  // if (
  //   !Object.keys(VaultStatus)
  //     .map((x) => x.toLocaleLowerCase())
  //     .includes(statusFilter)
  // ) {
  //   redirect(`/${locale}/form-builder/${id}/responses/${VaultStatus.NEW.toLowerCase()}`);
  // }

  if (hasApiKeyId) {
    return (
      <ResponsesApiContainer
        responseDownloadLimit={Number(await getAppSetting("responseDownloadLimit"))}
        overdueAfter={Number(await getAppSetting("nagwarePhaseEncouraged"))}
        statusFilter={StatusFilter.CONFIRMED}
      />
    );
  }

  return (
    <ResponsesContainer
      responseDownloadLimit={Number(await getAppSetting("responseDownloadLimit"))}
      overdueAfter={Number(await getAppSetting("nagwarePhaseEncouraged"))}
      statusFilter={statusFilter as StatusFilter}
    />
  );
}
