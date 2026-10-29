"use client";

import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { WarningIcon } from "@serverComponents/icons";
import { useTemplateMigrationProblems } from "@lib/store/hooks/useTemplateMigrationProblems";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useMigrationProblemFeedback } from "@lib/store/hooks/useMigrationProblemFeedback";

export const MigrationProblemsNotice = ({ id, locale }: { id: string; locale: string }) => {
  const { t } = useTranslation("form-builder");
  const problems = useTemplateMigrationProblems();
  useMigrationProblemFeedback(problems);
  const storeId = useTemplateStore((state) => state.id);

  if (problems.length === 0) return null;

  const formId = storeId && storeId !== id ? storeId : id;

  return (
    <div className="mb-5 flex max-w-[800px] gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
      <WarningIcon className="mt-0.5 size-6 shrink-0 fill-amber-700" />
      <div>
        <p className="mb-1 font-bold">{t("migrationProblems.count", { count: problems.length })}</p>
        <p className="mb-0">
          {t("migrationProblems.notice")}{" "}
          <Link href={`/${locale}/form-builder/${formId}/problems`}>
            {t("migrationProblems.review")}
          </Link>
        </p>
      </div>
    </div>
  );
};
