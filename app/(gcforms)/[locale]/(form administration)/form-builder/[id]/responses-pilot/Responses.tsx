import Image from "next/image";
import { useResponsesContext } from "./context/ResponsesContext";
import { useTranslation } from "@i18n/client";

import Skeleton from "react-loading-skeleton";

export const Responses = ({ actions }: { actions?: React.ReactNode }) => {
  const { newFormSubmissions } = useResponsesContext();
  const { t } = useTranslation("response-api");

  if (newFormSubmissions === null) {
    return (
      <div
        className="mb-8 rounded-2xl border-2 border-gray-300 bg-white p-8"
        data-testid="responses-loading"
      >
        <div className="flex items-center justify-between">
          <div className="w-2/3">
            <Skeleton className="mb-6 h-10 w-3/4" />
          </div>
          <div className="h-[196px] w-[218px]">
            <Skeleton style={{ height: "100%", width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  return newFormSubmissions && newFormSubmissions.length > 0 ? (
    <div className="flex items-center justify-between" data-testid="responses-available">
      <div>
        <h2 className="mb-8" data-testid="new-responses-heading">
          {t("loadKeyPage.newResponsesAvailable")}
        </h2>
        {actions}
      </div>
      <div>
        <Image
          src="/img/api-new-responses.svg"
          alt={t("loadKeyPage.newResponsesAvailable")}
          width={218}
          height={196}
        />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between" data-testid="no-responses">
      <div>
        <h2 className="mb-8" data-testid="no-responses-heading">
          {t("loadKeyPage.noNewResponsesAvailable")}
        </h2>
        {actions}
      </div>
      <div>
        <Image
          src="/img/api-no-responses.svg"
          alt={t("loadKeyPage.noNewResponsesAvailable")}
          width={218}
          height={196}
        />
      </div>
    </div>
  );
};
