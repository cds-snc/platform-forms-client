import { Metadata } from "next";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { serverTranslation } from "@i18n";
import { getFullTemplateByID } from "@lib/templates";
import { AccessControlError, createAbility } from "@lib/privileges";
import { VaultStatus } from "@lib/types";
import { listAllSubmissions } from "@lib/vault";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";
import { getAppSetting } from "@lib/appSettings";
import { isResponseId } from "@lib/validation";
import { ClientSide, ResponsesProps } from "./clientSide";
import { ucfirst } from "@lib/client/clientHelpers";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { locale, slug = [] },
  searchParams: { lastKey },
}: {
  params: { locale: string; slug: string[] };
  searchParams: { lastKey?: string };
}) {
  const [formID = null, statusQuery = "new"] = slug;

  const pageProps: ResponsesProps = {
    initialForm: null,
    vaultSubmissions: [],
    responseDownloadLimit: Number(await getAppSetting("responseDownloadLimit")),
    lastEvaluatedKey: null,
    nagwareResult: null,
  };

  const session = await auth();

  if (session && formID) {
    try {
      const ability = createAbility(session);

      const initialForm = await getFullTemplateByID(ability, formID);

      if (initialForm === null) {
        redirect(`/${locale}/404`);
      }

      pageProps.initialForm = initialForm;

      // get status from url params (default = new) and capitalize/cast to VaultStatus
      // Protect against invalid status query
      const status = Object.values(VaultStatus).includes(ucfirst(statusQuery) as VaultStatus)
        ? (ucfirst(statusQuery) as VaultStatus)
        : VaultStatus.NEW;

      let currentLastEvaluatedKey = null;

      // build up lastEvaluatedKey from lastKey url param
      if (lastKey && isResponseId(String(lastKey))) {
        currentLastEvaluatedKey = {
          Status: status,
          NAME_OR_CONF: `NAME#${lastKey}`,
          FormID: formID,
        };
      }

      const { submissions, lastEvaluatedKey } = await listAllSubmissions(
        ability,
        formID,
        status,
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
  return (
    <FormBuilderInitializer initialForm={pageProps.initialForm} locale={locale}>
      <ClientSide {...pageProps} />
    </FormBuilderInitializer>
  );
}
