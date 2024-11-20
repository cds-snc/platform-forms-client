"use client";
import { useRehydrate } from "@lib/store/useTemplateStore";
import { Responses } from "./Responses";
import { useTranslation } from "@i18n/client";
import { StatusFilter } from "../page";

export const ResponsesApiContainer = ({
  responseDownloadLimit,
  overdueAfter,
  statusFilter,
}: {
  responseDownloadLimit: number;
  overdueAfter: number;
  statusFilter: StatusFilter;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const isReady = useRehydrate();

  // Wait until the template store is fully hydrated before rendering the content
  if (!isReady) return null;

  return (
    <>
      <div className="mr-10">
        <h1>{t("apiDashboard.title")}</h1>
        <Responses
          statusFilter={statusFilter}
          responseDownloadLimit={responseDownloadLimit}
          overdueAfter={overdueAfter}
          isApiRetrieval={true}
        />
      </div>
    </>
  );
};
