import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { getAppSetting } from "@lib/appSettings";
import { authCheckAndThrow } from "@lib/actions";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { checkKeyExists } from "@lib/serviceAccount";
import { ResponsesApiContainer } from "./components/ResponsesApiContainer";
import { ResponsesContainer } from "./components/ResponsesContainer";
import { redirect } from "next/navigation";
import { StatusFilter } from "./types";

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

/**
 * Ensure we have a valid StatusFilter
 * @param statusFilter
 * @returns boolean
 */
const isValidStatusFilter = (statusFilter: string): statusFilter is StatusFilter => {
  return Object.values(StatusFilter).includes(statusFilter as StatusFilter);
};

/**
 * Validate the StatusFilter and redirect if necessary
 * Redirects on invalid or multiple statusFilter params
 *
 * @param statusFilterParams
 * @param locale
 * @param id
 * @returns StatusFilter
 */
const validateStatusFilterOrRedirect = (
  statusFilterParams: string[],
  locale: string,
  id: string,
  isApiRetrieval: boolean
): StatusFilter => {
  const redirectToDefault = () => redirect(`/${locale}/form-builder/${id}/responses`);

  // No statusFilterParams passed, return defaults
  if (!statusFilterParams) {
    if (isApiRetrieval) {
      return StatusFilter.CONFIRMED;
    }

    return StatusFilter.NEW;
  }

  // If there are multiple statusFilterParams (ie, /new/something)
  if (statusFilterParams && statusFilterParams.length > 1) {
    // We only care about the first
    const firstStatusFilter = statusFilterParams[0];

    // If the remaining statusFilter is invalid, redirect to default view
    if (!isValidStatusFilter(firstStatusFilter)) {
      redirectToDefault();
    }

    // If isApiRetrieval and statusFilter is not CONFIRMED, redirect to default
    if (isApiRetrieval && firstStatusFilter !== StatusFilter.CONFIRMED) {
      redirectToDefault();
    }

    // Redirect to the valid statusFilter
    redirect(`/${locale}/form-builder/${id}/responses/${firstStatusFilter}`);
  }

  // statusFilterParams is an array with one element
  const statusFilter = statusFilterParams[0] as StatusFilter;

  // if statusFilter is invalid, redirect to default view
  if (!isValidStatusFilter(statusFilter)) {
    redirectToDefault();
  }

  // If isApiRetrieval and statusFilter is not CONFIRMED, redirect to default
  if (statusFilter && statusFilter !== StatusFilter.CONFIRMED && isApiRetrieval) {
    redirectToDefault();
  }

  return statusFilter;
};

export default async function Page({
  params: { locale, id, statusFilter: statusFilterParams },
}: {
  params: { locale: string; id: string; statusFilter: string[] };
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

  const isApiRetrieval = !!(await checkKeyExists(id));

  const statusFilter = validateStatusFilterOrRedirect(
    statusFilterParams,
    locale,
    id,
    isApiRetrieval
  );

  if (isApiRetrieval) {
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
