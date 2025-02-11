"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";

import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { SaveAndResumeToggle } from "./SaveAndResumeToggle";
import { updateTemplateFormSaveAndResume } from "@formBuilder/actions";

export const SetSaveAndResume = ({
  formId,
  isPublished,
}: {
  formId: string;
  isPublished: boolean;
}) => {
  const { t } = useTranslation("form-builder");

  const { saveAndResume, setSaveAndResume } = useTemplateStore((s) => ({
    saveAndResume: s.saveAndResume,
    setSaveAndResume: s.setSaveAndResume,
  }));

  const [status, setStatus] = useState(saveAndResume ? "on" : "off");

  const handleToggle = (value: boolean) => {
    setStatus(value == true ? "off" : "on");
  };

  const saveFormStatus = useCallback(async () => {
    const saveAndResume = status === "off" ? false : true;

    if (isPublished) return;

    const result = await updateTemplateFormSaveAndResume({
      id: formId,
      saveAndResume,
    });

    if (result?.error) {
      toast.error(t("saveAndResume.savedErrorMessage"));
      return;
    }

    setSaveAndResume(status === "off" ? false : true);
    toast.success(t("saveAndResume.savedSuccessMessage"));
  }, [status, t, setSaveAndResume, formId, isPublished]);

  const { getFlag } = useFeatureFlags();
  const saveAndResumeEnabled = getFlag(FeatureFlags.saveAndResume);

  if (!saveAndResumeEnabled || isPublished) {
    return null;
  }

  return (
    <div className="mb-10">
      <h2 data-form-id={formId}>{t("saveAndResume.title")}</h2>
      <p className="mb-2 font-bold">{t("saveAndResume.toggleDescription.text1")}</p>
      <p>{t("saveAndResume.toggleDescription.text2")}</p>
      <div className="mb-4">
        <SaveAndResumeToggle
          isChecked={status === "off" ? false : true}
          setIsChecked={handleToggle}
          onLabel={t("saveAndResume.toggleOn")}
          offLabel={t("saveAndResume.toggleOff")}
          description={t("saveAndResume.a11yDescription")}
        />
      </div>

      <Button theme="secondary" onClick={saveFormStatus}>
        {t("saveAndResume.saveButton")}
      </Button>
    </div>
  );
};
