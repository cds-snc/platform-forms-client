import { authCheckAndThrow } from "@lib/actions";
import { serverTranslation } from "@i18n";
import { BatchAttachmentDownload } from "./BatchAttachmentDownload";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = locale === "fr" ? "fr" : "en";
  const { t } = await serverTranslation("my-forms", { lang: language });

  try {
    await authCheckAndThrow();
  } catch {
    return (
      <main>
        <h1>{t("responseTemplate.attachmentsUnavailableTitle")}</h1>
      </main>
    );
  }

  return <BatchAttachmentDownload />;
}
