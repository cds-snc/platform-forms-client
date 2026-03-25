"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";

import { SaveAndResumeToggle } from "./SaveAndResumeToggle";
import { updateTemplateFormSaveAndResume } from "@formBuilder/actions";

export const SetSaveAndResume = ({ formId }: { formId: string }) => {
  "use memo";
  const { t } = useTranslation("form-builder");

  const { saveAndResume, setSaveAndResume } = useTemplateStore((s) => ({
    saveAndResume: s.saveAndResume,
    setSaveAndResume: s.setSaveAndResume,
  }));

  const handleToggle = (value: boolean) => {
    const newStatus = value == true ? "off" : "on";
    saveFormStatus(newStatus);
  };

  const saveFormStatus = async (newStatus: string) => {
    const saveAndResume = newStatus === "off" ? false : true;

    const result = await updateTemplateFormSaveAndResume({
      id: formId,
      saveAndResume,
    });

    if (result?.error) {
      toast.error(t("saveAndResume.savedErrorMessage"));
      return;
    }

    setSaveAndResume(saveAndResume);
    toast.success(t("saveAndResume.savedSuccessMessage"));
  };

  return (
    <div className="mb-10">
      <h2 data-form-id={formId}>{t("saveAndResume.title")}</h2>
      <p className="mb-2 font-bold">{t("saveAndResume.toggleDescription.text1")}</p>
      <p>{t("saveAndResume.toggleDescription.text2")}</p>

      <SaveAndResumeToggle
        isChecked={saveAndResume}
        setIsChecked={handleToggle}
        onLabel={t("saveAndResume.toggleOn")}
        offLabel={t("saveAndResume.toggleOff")}
        description={t("saveAndResume.a11yDescription")}
      />
    </div>
  );
};
