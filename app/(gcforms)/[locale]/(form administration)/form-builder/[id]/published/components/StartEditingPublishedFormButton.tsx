"use client";

import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { Alert, Button } from "@clientComponents/globals";
import { updateTemplatePublishedStatus } from "@formBuilder/actions";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { clearTemplateStore } from "@lib/store/utils";

export const StartEditingPublishedFormButton = ({ id, locale }: { id: string; locale: string }) => {
  const { t } = useTranslation("form-builder");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { setId, setIsPublished } = useTemplateStore((s) => ({
    setId: s.setId,
    setIsPublished: s.setIsPublished,
  }));

  const handleStartEditing = async () => {
    setHasError(false);
    setIsSubmitting(true);

    const { formRecord, error } = await updateTemplatePublishedStatus({
      id,
      isPublished: false,
      publishReason: "",
      publishFormType: "",
      publishDescription: "",
    });

    if (error || !formRecord) {
      setHasError(true);
      setIsSubmitting(false);
      return;
    }

    setId(id);
    setIsPublished(false);
    clearTemplateStore();
    window.location.assign(`/${locale}/form-builder/${id}/edit`);
  };

  return (
    <div className="mb-10 max-w-3xl">
      <h3 className="mb-1">{t("editPublishedFormTitle")}</h3>
      <p className="mb-4">{t("editPublishedFormDescription")}</p>
      <Button onClick={handleStartEditing} disabled={isSubmitting} theme="secondary">
        {t("editPublishedForm")}
      </Button>
      {hasError && (
        <Alert.Danger focussable={true} className="mt-4">
          <p className="mb-0">{t("editPublishedFormError")}</p>
        </Alert.Danger>
      )}
    </div>
  );
};
