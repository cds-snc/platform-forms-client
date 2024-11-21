"use client";
import { useTemplateStore, useRehydrate } from "@lib/store/useTemplateStore";
import { isEmailDelivery } from "@lib/utils/form-builder";
import { DeliveryOptionEmail } from "./DeliveryOptionEmail";
import { NavigationTabs } from "./NavigationTabs";
import { ResponsesFooter } from "./ResponsesFooter";
import { Responses } from "./Responses";
import { ManageFormAccessDialogContainer } from "./ManageFormAccessDialog";
import { StatusFilter } from "../types";
import { useTranslation } from "@i18n/client";
import { SystemStatus } from "../../[statusFilter]/components/SystemStatus/SystemStatus";

export const ResponsesContainer = ({
  responseDownloadLimit,
  overdueAfter,
  statusFilter,
  isApiRetrieval,
}: {
  responseDownloadLimit: number;
  overdueAfter: number;
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
        <NavigationTabs formId={id} />
        <Responses
          statusFilter={statusFilter}
          responseDownloadLimit={responseDownloadLimit}
          overdueAfter={overdueAfter}
        />
        <ResponsesFooter formId={id} />
      </div>
      <ManageFormAccessDialogContainer formId={id} />
    </>
  );
};
