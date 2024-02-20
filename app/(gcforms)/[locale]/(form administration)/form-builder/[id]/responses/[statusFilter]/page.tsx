import { Metadata } from "next";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { serverTranslation } from "@i18n";
import { AccessControlError } from "@lib/privileges";
import { getAppSetting } from "@lib/appSettings";
import { Responses, ResponsesProps } from "./components/Responses";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { fetchSubmissions, fetchTemplate } from "./actions";

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
      const initialForm = await fetchTemplate(id);

      if (initialForm === null) {
        redirect(`/${locale}/404`);
      }

      pageProps.initialForm = initialForm;

      const { submissions, lastEvaluatedKey } = await fetchSubmissions({
        formId: id,
        status: statusFilter,
        lastKey,
      });

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
