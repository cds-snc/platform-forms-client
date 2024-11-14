"use client";
import { useTemplateStore, useRehydrate } from "@lib/store/useTemplateStore";
import { isEmailDelivery } from "@lib/utils/form-builder";
import { DeliveryOptionEmail } from "./DeliveryOptionEmail";
import { NavigationTabs } from "./NavigationTabs";
import { ResponsesFooter } from "./ResponsesFooter";
import { Responses } from "./Responses";
import { ManageFormAccessDialogContainer } from "./ManageFormAccessDialog";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { useTranslation } from "@i18n/client";

import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const ClientContainer = ({
  responseDownloadLimit,
  overdueAfter,
}: {
  responseDownloadLimit: number;
  overdueAfter: number;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const { isPublished, id, deliveryOption } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
    deliveryOption: s.deliveryOption,
  }));

  const isReady = useRehydrate();

  const { hasApiKeyId } = useFormBuilderConfig();

  // Wait until the template store is fully hydrated before rendering the content
  if (!isReady) return null;

  // Delivery option is API
  if (hasApiKeyId) {
    return (
      <>
        <HealthCheckBox.Container>
          <HealthCheckBox.Success titleKey="systemHealth.contactSupport.title">
            <HealthCheckBox.Text i18nKey="systemHealth.contactSupport.description" />
          </HealthCheckBox.Success>
          <HealthCheckBox.Warning titleKey="systemHealth.throttling.title">
            <HealthCheckBox.Text i18nKey="systemHealth.throttling.description" />
          </HealthCheckBox.Warning>
          <HealthCheckBox.Danger titleKey="systemHealth.problems.title" count={3}>
            <HealthCheckBox.Text i18nKey="systemHealth.problems.description" />
          </HealthCheckBox.Danger>
        </HealthCheckBox.Container>
        <div className="mr-10">
          <h1>{t("apiDashboard.title")}</h1>
          <Responses responseDownloadLimit={responseDownloadLimit} overdueAfter={overdueAfter} />
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
        <Responses responseDownloadLimit={responseDownloadLimit} overdueAfter={overdueAfter} />
        <ResponsesFooter formId={id} />
      </div>
      <ManageFormAccessDialogContainer formId={id} />
    </>
  );
};
