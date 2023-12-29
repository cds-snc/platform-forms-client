"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "../store";
import { toast } from "./shared/Toast";
import axios from "axios";

import { Button } from "@clientComponents/globals";
import { ClosingDateToggle } from "./ClosingDateToggle";
export const SetClosingDate = ({ formID }: { formID: string }) => {
  const { t } = useTranslation("form-builder");

  const { closingDate, setClosingDate } = useTemplateStore((s) => ({
    closingDate: s.closingDate,
    setClosingDate: s.setClosingDate,
  }));

  const [status, setStatus] = useState(closingDate ? "closed" : "open");

  const handleToggle = (value: boolean) => {
    setStatus(value == true ? "closed" : "open");
  };

  const saveFormStatus = useCallback(async () => {
    let closeDate = "open";

    if (status === "closed") {
      const now = new Date();
      closeDate = now.toISOString();
    }

    const result = await axios({
      url: `/api/templates/${formID}`,
      method: "PUT",
      data: {
        closingDate: closeDate,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });

    // update the local store
    setClosingDate(status !== "open" ? closeDate : null);

    if (!result || axios.isAxiosError(result)) {
      toast.error(t("closingDate.savedErrorMessage"));

      return;
    }

    toast.success(t("closingDate.savedSuccessMessage"));
  }, [status, formID, setClosingDate, t]);

  return (
    <div className="mb-10">
      <h2>{t("closingDate.title")}</h2>
      <h3>{t("closingDate.status")}</h3>
      <p className="mb-6">{t("closingDate.description")}</p>
      <div className="mb-4">
        <ClosingDateToggle
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
