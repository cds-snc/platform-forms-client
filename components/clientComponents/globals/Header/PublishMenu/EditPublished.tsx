type Translate = (key: string) => string;
import { Button } from "@clientComponents/globals";
import { EventKeys } from "@root/lib/hooks/useCustomEvent";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { useTemplateStore } from "@root/lib/store/useTemplateStore";
import { isEmailDelivery } from "@root/lib/utils/form-builder";

export const EditPublished = ({ formId, t }: { formId: string; t: Translate }) => {
  const { getFlag } = useFeatureFlags();
  const templateVersioningEnabled = getFlag("templateVersioning");

  const { deliveryOption } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
    deliveryOption: s.deliveryOption,
  }));

  if (deliveryOption && isEmailDelivery(deliveryOption)) {
    return null;
  }

  if (!templateVersioningEnabled) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      <p className="mb-2 text-sm font-semibold text-slate-900">{t("publishViewEdit.title")}</p>
      <p className="mb-4 text-sm text-slate-600">{t("publishViewEdit.description")}</p>
      <Button
        onClick={() => {
          const ev = new CustomEvent(EventKeys.openCreateDraftConfirmDialog, {
            detail: { id: formId },
          });
          window.document.dispatchEvent(ev);
        }}
        theme="secondary"
        className="px-2 py-1 text-sm font-medium text-slate-700! no-underline"
      >
        {t("publishViewEdit.button")}
      </Button>
    </div>
  );
};
