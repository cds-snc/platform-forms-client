"use client";
import { useTemplateStore, useRehydrate } from "@lib/store/useTemplateStore";
import { isEmailDelivery } from "@lib/utils/form-builder";
import { DeliveryOptionEmail } from "./DeliveryOptionEmail";
import { NavigationTabs } from "./NavigationTabs";
import { ResponsesFooter } from "./ResponsesFooter";
import { Responses } from "./Responses";
import { ManageFormAccessDialog } from "./ManageFormAccessDialog";
import { TemplateUser } from "./ManageFormAccessDialog/types";

export const ClientContainer = ({
  responseDownloadLimit,
  overdueAfter,
  templateUsers,
}: {
  responseDownloadLimit: number;
  overdueAfter: number;
  templateUsers: TemplateUser[] | undefined;
}) => {
  const { isPublished, id, deliveryOption } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
    deliveryOption: s.deliveryOption,
  }));

  const isReady = useRehydrate();

  // Wait until the template store is fully hydrated before rendering the content
  if (!isReady) return null;

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

  return (
    <>
      <div className="mr-10">
        <NavigationTabs formId={id} />
        <Responses responseDownloadLimit={responseDownloadLimit} overdueAfter={overdueAfter} />
        <ResponsesFooter formId={id} />
      </div>
      <ManageFormAccessDialog templateUsers={templateUsers} />
    </>
  );
};
