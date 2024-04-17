"use client";
import Link from "next/link";
import { ReportDialog } from "./Dialogs/ReportDialog";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

// TODO: move to an app setting variable
const MAX_REPORT_COUNT = 20;

export const ResponsesFooter = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();

  const onSuccessfulReport = () => {
    router.refresh();
  };

  return (
    <div className="mt-8">
      <ReportDialog
        apiUrl={`/api/id/${formId}/submission/report`}
        maxEntries={MAX_REPORT_COUNT}
        onSuccess={onSuccessfulReport}
      />
      <Link
        href={`/form-builder/${formId}/responses/problem`}
        className="ml-12 text-black visited:text-black"
      >
        {t("responses.viewAllProblemResponses")}
      </Link>
    </div>
  );
};
