import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { getAppSetting } from "@lib/appSettings";
import { Responses, ResponsesProps } from "./components/Responses";
import { fetchSubmissions, fetchTemplate } from "./actions";
import { authCheck } from "@lib/actions";
import { RetrievalError } from "./components/RetrievalError";

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
  searchParams: { lastKey },
}: {
  params: { locale: string; id: string; statusFilter: string };
  searchParams: { lastKey?: string };
}) {
  const { session } = await authCheck().catch(() => ({ session: null }));
  const isAuthenticated = session !== null;

  const pageProps: ResponsesProps = {
    initialForm: null,
    vaultSubmissions: [],
    responseDownloadLimit: Number(await getAppSetting("responseDownloadLimit")),
    lastEvaluatedKey: null,
    nagwareResult: null,
    overdueAfter: Number(await getAppSetting("nagwarePhaseEncouraged")),
  };

  try {
    if (isAuthenticated) {
      const initialForm = await fetchTemplate(id);

      pageProps.initialForm = initialForm;

      const { submissions, lastEvaluatedKey } = await fetchSubmissions({
        formId: id,
        status: statusFilter,
        lastKey,
      });

      pageProps.vaultSubmissions = submissions;
      pageProps.lastEvaluatedKey = lastEvaluatedKey;
    }
  } catch (error) {
    return <RetrievalError />;
  }

  // TODO: re-enable nagware when we have a better solution for how to handle filtered statuses
  /*
      nagwareResult = allSubmissions.submissions.length
      ? await detectOldUnprocessedSubmissions(allSubmissions.submissions)
      : null;
      */

  return <Responses {...pageProps} />;
}
