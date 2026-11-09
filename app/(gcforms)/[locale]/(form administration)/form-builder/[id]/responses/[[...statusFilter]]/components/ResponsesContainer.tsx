"use client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import { isEmailDelivery } from "@lib/utils/form-builder";
import { DeliveryOptionEmail } from "./DeliveryOptionEmail";
import { NavigationTabs } from "./NavigationTabs";
import { ResponsesFooter } from "./ResponsesFooter";
import { Responses } from "./Responses";
import { StatusFilter } from "../types";
import { useTranslation } from "@i18n/client";
import { ResponseBetaLink } from "./ResponseBetaLink";

export const ResponsesContainer = ({
  hasOverdue,
  responseDownloadLimit,
  responsesDownloadZipMaxSizeMB,
  overdueAfter,
  nagwarePromptAfter,
  nagwareWarnAfter,
  nagwareEnabled,
  statusFilter,
  isApiRetrieval,
}: {
  hasOverdue: boolean;
  responseDownloadLimit: number;
  responsesDownloadZipMaxSizeMB: number;
  overdueAfter: number;
  nagwarePromptAfter: number;
  nagwareWarnAfter: number;
  nagwareEnabled: boolean;
  statusFilter: StatusFilter;
  isApiRetrieval: boolean;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const { isPublished, id, deliveryOption } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
    deliveryOption: s.deliveryOption,
  }));

  const isReady = useRehydrate();

  // Wait until the template store is fully hydrated before rendering the content
  if (!isReady) return null;

  if (isApiRetrieval) {
    return (
      <>
        <div className="mr-10">
          <div className="mb-4 flex justify-between">
            <div>
              <h1>{t("apiDashboard.title")}</h1>
              <ResponseBetaLink formId={id} className="mb-8 block" />
            </div>
          </div>

          <Responses
            hasOverdue={hasOverdue}
            statusFilter={statusFilter}
            responseDownloadLimit={responseDownloadLimit}
            responsesDownloadZipMaxSizeMB={responsesDownloadZipMaxSizeMB}
            overdueAfter={overdueAfter}
            nagwarePromptAfter={nagwarePromptAfter}
            nagwareWarnAfter={nagwareWarnAfter}
            nagwareEnabled={nagwareEnabled}
            isApiRetrieval={true}
          />
          {/* Dialog is now provided globally in layout */}
        </div>
      </>
    );
  }

  // Delivery option is Email
  if (deliveryOption && isEmailDelivery(deliveryOption)) {
    return (
      <DeliveryOptionEmail
        email={deliveryOption.emailAddress}
        emailSubject={{
          en: deliveryOption.emailSubjectEn || "",
          fr: deliveryOption.emailSubjectFr || "",
        }}
        isPublished={isPublished}
        formId={id}
      />
    );
  }

  // Delivery option is Download
  return (
    <>
      <div className="mr-10">
        <h1>{t("responses.title")}</h1>
        <ResponseBetaLink formId={id} className="mb-8 block" />
        <NavigationTabs formId={id} />
        <Responses
          hasOverdue={hasOverdue}
          statusFilter={statusFilter}
          responseDownloadLimit={responseDownloadLimit}
          responsesDownloadZipMaxSizeMB={responsesDownloadZipMaxSizeMB}
          overdueAfter={overdueAfter}
          nagwarePromptAfter={nagwarePromptAfter}
          nagwareWarnAfter={nagwareWarnAfter}
          nagwareEnabled={nagwareEnabled}
        />
        <ResponsesFooter formId={id} />
      </div>
      {/* Dialog is now provided globally in layout */}
    </>
  );
};
