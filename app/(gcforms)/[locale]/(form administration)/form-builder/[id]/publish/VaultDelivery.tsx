"use client";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const VaultDelivery = () => {
  const { t } = useTranslation("form-builder");

  const { deliveryOption } = useTemplateStore((s) => ({
    deliveryOption: s.deliveryOption,

    id: s.id,
  }));

  if (deliveryOption !== undefined) return null;

  return (
    <>
      <li className="mb-5 bg-gray-50 p-1.5">
        <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("publishingRemovesTestResponses")}</h3>
        <p className="text-sm">{t("publishingRemovesTestResponsesDescription")}</p>
      </li>
    </>
  );
};
