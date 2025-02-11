"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";

import { SaveAndResumeToggle } from "./SaveAndResumeToggle";

// import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

export const SetSaveAndResume = ({ formId }: { formId: string }) => {
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
    setSaveAndResume(status === "off" ? false : true);
    toast.success(t("saveAndResume.savedSuccessMessage"));
  }, [status, t, setSaveAndResume]);

  // const { getFlag } = useFeatureFlags();
  // const hasScheduleClosingDate = getFlag();

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
