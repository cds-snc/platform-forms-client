"use client";
import { useTemplateStore, useRehydrate } from "@lib/store/useTemplateStore";
import { Responses } from "./Responses";
import { useTranslation } from "@i18n/client";
import { SystemStatus } from "./SystemStatus";
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
  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  const isReady = useRehydrate();

  // Wait until the template store is fully hydrated before rendering the content
  if (!isReady) return null;

  return (
    <>
      <div className="mr-10">
        <h1>{t("apiDashboard.title")}</h1>
        <SystemStatus formId={id} />
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
