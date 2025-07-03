"use client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import { isEmailDelivery } from "@lib/utils/form-builder";
import { DeliveryOptionEmail } from "./DeliveryOptionEmail";
import { NavigationTabs } from "./NavigationTabs";
import { ResponsesFooter } from "./ResponsesFooter";
import { Responses } from "./Responses";
import { ManageFormAccessDialogContainer } from "./ManageFormAccessDialog";
import { StatusFilter } from "../types";
import { useTranslation } from "@i18n/client";
import { ManageFormAccessButton } from "./ManageFormAccessDialog/ManageFormAccessButton";

export const ResponsesContainer = ({
  hasOverdue,
  responseDownloadLimit,
  overdueAfter,
  statusFilter,
  isApiRetrieval,
}: {
  hasOverdue: boolean;
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
          <div className="mb-4 flex justify-between">
            <h1>{t("apiDashboard.title")}</h1>
            {isPublished && (
              <div>
                <ManageFormAccessButton />
              </div>
            )}
          </div>
          <Responses
            hasOverdue={hasOverdue}
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
          hasOverdue={hasOverdue}
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
