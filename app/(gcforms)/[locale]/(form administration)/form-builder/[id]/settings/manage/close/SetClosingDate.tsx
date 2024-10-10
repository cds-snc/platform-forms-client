"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";
import axios from "axios";

import { Button } from "@clientComponents/globals";
import { ClosingDateToggle } from "./ClosingDateToggle";
import { ClosedMessage } from "./ClosedMessage";
import { ClosedDetails } from "@lib/types";

export const SetClosingDate = ({
  formId,
  closedDetails,
}: {
  formId: string;
  closedDetails: ClosedDetails | null;
}) => {
  const { t } = useTranslation("form-builder");

  const { closingDate, setClosingDate } = useTemplateStore((s) => ({
    closingDate: s.closingDate,
    setClosingDate: s.setClosingDate,
  }));

  const [closedMessage, setClosedMessage] = useState<ClosedDetails | null>(closedDetails);

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
      url: `/api/templates/${formId}`,
      method: "PUT",
      data: {
        closingDate: closeDate,
        closedDetails: closedMessage,
      },
      timeout: 5000,
    });

    // update the local store
    setClosingDate(status !== "open" ? closeDate : null);

    if (!result || axios.isAxiosError(result)) {
      toast.error(t("closingDate.savedErrorMessage"));

      return;
    }

    toast.success(t("closingDate.savedSuccessMessage"));
  }, [status, formId, setClosingDate, t, closedMessage]);

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
      <div className="mb-4 w-3/5">
        <ClosedMessage closedDetails={closedMessage} setClosedDetails={setClosedMessage} />
      </div>
      <Button theme="secondary" onClick={saveFormStatus}>
        {t("closingDate.saveButton")}
      </Button>
    </div>
  );
};
