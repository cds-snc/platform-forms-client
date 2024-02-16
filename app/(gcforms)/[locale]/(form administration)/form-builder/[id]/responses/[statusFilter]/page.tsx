import { Metadata } from "next";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { serverTranslation } from "@i18n";
import { getFullTemplateByID } from "@lib/templates";
import { AccessControlError, createAbility } from "@lib/privileges";
import { VaultStatus } from "@lib/types";
import { listAllSubmissions } from "@lib/vault";
import { getAppSetting } from "@lib/appSettings";
import { isResponseId } from "@lib/validation";
import { Responses, ResponsesProps } from "./_components/Responses";
import { ucfirst } from "@lib/client/clientHelpers";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";

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
  params: { locale, id, statusFilter },
  searchParams: { lastKey },
}: {
  params: { locale: string; id: string; statusFilter: string };
  searchParams: { lastKey?: string };
}) {
  const pageProps: ResponsesProps = {
    initialForm: null,
    vaultSubmissions: [],
    responseDownloadLimit: Number(await getAppSetting("responseDownloadLimit")),
    lastEvaluatedKey: null,
    nagwareResult: null,
  };

  const session = await auth();
  const isAuthenticated = session !== null;

  if (session && id) {
    try {
      const ability = createAbility(session);
      const initialForm = await getFullTemplateByID(ability, id);

      if (initialForm === null) {
        redirect(`/${locale}/404`);
      }

      pageProps.initialForm = initialForm;

      // get status from url params (default = new) and capitalize/cast to VaultStatus
      // Protect against invalid status query
      const selectedStatus = Object.values(VaultStatus).includes(
        ucfirst(statusFilter) as VaultStatus
      )
        ? (ucfirst(statusFilter) as VaultStatus)
        : VaultStatus.NEW;

      let currentLastEvaluatedKey = null;

      // build up lastEvaluatedKey from lastKey url param
      if (lastKey && isResponseId(String(lastKey))) {
        currentLastEvaluatedKey = {
          Status: selectedStatus,
          NAME_OR_CONF: `NAME#${lastKey}`,
          formID: id,
        };
      }

      const { submissions, lastEvaluatedKey } = await listAllSubmissions(
        ability,
        id,
        selectedStatus,
        currentLastEvaluatedKey
      );

      pageProps.vaultSubmissions = submissions;
      pageProps.lastEvaluatedKey = lastEvaluatedKey;

      // TODO: re-enable nagware when we have a better solution for how to handle filtered statuses
      /*
        nagwareResult = allSubmissions.submissions.length
        ? await detectOldUnprocessedSubmissions(allSubmissions.submissions)
        : null;
        */
    } catch (e) {
      if (e instanceof AccessControlError) {
        redirect(`/${locale}/admin/unauthorized`);
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl">
          <LoggedOutTab tabName={LoggedOutTabName.RESPONSES} />
        </div>
      </>
    );
  }

  return <Responses {...pageProps} />;
}
