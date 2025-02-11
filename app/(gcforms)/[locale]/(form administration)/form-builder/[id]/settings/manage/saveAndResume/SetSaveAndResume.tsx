"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
// import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";

import { SaveAndResumeToggle } from "./SaveAndResumeToggle";
import { SaveSuccess } from "./SaveSuccess";

// import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

export const SetSaveAndResume = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");

  /*
  const { closingDate, setClosingDate } = useTemplateStore((s) => ({
    closingDate: s.closingDate,
    setClosingDate: s.setClosingDate,
  }));
  */

  const [status, setStatus] = useState("closed");

  const handleToggle = (value: boolean) => {
    setStatus(value == true ? "closed" : "open");
  };

  const saveFormStatus = useCallback(async () => {
    /*
    if (!result || result.error) {
      toast.error(t("closingDate.savedErrorMessage"));
      return;
    }
    */

    // Setting local store
    // setClosingDate(closeDate || null);

    if (status === "closed") {
      toast.success(<SaveSuccess />, "wide");
    } else {
      toast.success(t("closingDate.savedSuccessMessage"));
    }
  }, [status, t]);

  // const { getFlag } = useFeatureFlags();
  // const hasScheduleClosingDate = getFlag();

  return (
    <div className="mb-10">
      <h2>
        {t("closingDate.title")} {formId}
      </h2>
      <div className="mb-4">
        <SaveAndResumeToggle
          isChecked={status === "closed" ? false : true}
          setIsChecked={handleToggle}
          onLabel={t("closingDate.closed")}
          offLabel={t("closingDate.open")}
          description={t("closingDate.status")}
        />
      </div>

      <Button theme="secondary" onClick={saveFormStatus}>
        {t("closingDate.saveButton")}
      </Button>
    </div>
  );
};
