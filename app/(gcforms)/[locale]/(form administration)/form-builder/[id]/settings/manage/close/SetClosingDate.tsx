"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";

import { ClosedDetails } from "@lib/types";
import { Button } from "@clientComponents/globals";

import { ClosingDateToggle } from "./ClosingDateToggle";
import { ClosedMessage } from "./ClosedMessage";
import { ClosedSuccess } from "./ClosedSuccess";

import { closeForm } from "@formBuilder/actions";

export const SetClosingDate = ({
  formId,
  closedDetails,
}: {
  formId: string;
  closedDetails?: ClosedDetails;
}) => {
  const { t } = useTranslation("form-builder");

  const { closingDate, setClosingDate } = useTemplateStore((s) => ({
    closingDate: s.closingDate,
    setClosingDate: s.setClosingDate,
  }));

  const [closedMessage, setClosedMessage] = useState<ClosedDetails | undefined>(closedDetails);

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

    const result = await closeForm({
      id: formId,
      closingDate: closeDate,
      closedDetails: closedMessage,
    });

    if (!result || result.error) {
      toast.error(t("closingDate.savedErrorMessage"));
      return;
    }

    // update the local store
    setClosingDate(status !== "open" ? closeDate : null);

    if (status === "closed") {
      toast.success(<ClosedSuccess />, "wide");
    } else {
      toast.success(t("closingDate.savedSuccessMessage"));
    }
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