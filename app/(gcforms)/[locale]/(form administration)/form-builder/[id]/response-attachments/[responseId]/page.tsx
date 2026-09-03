import { authCheckAndThrow } from "@lib/actions";
import { retrieveSubmissions } from "@lib/vault";
import { isResponseId } from "@lib/validation/validation";
import { serverTranslation } from "@i18n";
import { AttachmentDownload } from "./AttachmentDownload";

const unavailableResponse = async (locale: string) => {
  const language = locale === "fr" ? "fr" : "en";
  const { t } = await serverTranslation("my-forms", { lang: language });

  return (
    <main>
      <h1>{t("responseTemplate.attachmentsUnavailableTitle")}</h1>
      <p>{t("responseTemplate.attachmentsUnavailableMessage")}</p>
    </main>
  );
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string; responseId: string }>;
}) {
  const { locale, id, responseId } = await params;
  const language = locale === "fr" ? "fr" : "en";
  const { t } = await serverTranslation("my-forms", { lang: language });

  try {
    await authCheckAndThrow();
  } catch {
    return unavailableResponse(locale);
  }

  if (!isResponseId(responseId)) {
    return unavailableResponse(locale);
  }

  const [submission] = await retrieveSubmissions(id, [responseId]);
  const attachments = (submission?.fileAttachments ?? []).filter(
    (attachment): attachment is typeof attachment & { downloadLink: string } =>
      typeof attachment.downloadLink === "string"
  );

  if (!submission || !attachments.length) {
    return unavailableResponse(locale);
  }

  return (
    <AttachmentDownload
      responseId={responseId}
      attachments={attachments}
      downloadingTitle={t("responseTemplate.attachmentsDownloading")}
      unavailableTitle={t("responseTemplate.attachmentsUnavailableTitle")}
      unavailableMessage={t("responseTemplate.attachmentsUnavailableMessage")}
    />
  );
}
