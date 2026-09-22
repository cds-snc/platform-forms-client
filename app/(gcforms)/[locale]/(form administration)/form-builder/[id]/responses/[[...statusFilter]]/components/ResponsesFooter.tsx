"use client";
import Link from "next/link";
import { ReportDialog } from "./Dialogs/ReportDialog";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

// TODO: move to an app setting variable
const MAX_REPORT_COUNT = 20;

export const ResponsesFooter = ({ formId }: { formId: string }) => {
  const { t, i18n } = useTranslation("form-builder-responses");
  const router = useRouter();

  const onSuccessfulReport = () => {
    router.refresh();
  };

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-12 gap-y-4">
      <ReportDialog
        apiUrl={`/api/id/${formId}/submission/report`}
        maxEntries={MAX_REPORT_COUNT}
        onSuccess={onSuccessfulReport}
      />
      <Link
        href={`/${i18n.language}/form-builder/${formId}/responses/problem`}
        className="text-black visited:text-black"
      >
        {t("responses.viewAllProblemResponses")}
      </Link>
      <Link
        href={`/${i18n.language}/form-builder/${formId}/response-attachments`}
        className="text-black visited:text-black"
      >
        {t("responses.downloadAttachments")}
      </Link>
    </div>
  );
};
