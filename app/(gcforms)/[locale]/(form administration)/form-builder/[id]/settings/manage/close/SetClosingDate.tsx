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
import { ClosedDateBanner } from "./ClosedDateBanner";

import { closeForm } from "@formBuilder/actions";
import { ClosingDateDialog } from "./ClosingDateDialog";

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

  const validateClosedMessage = useCallback(() => {
    const hasClosedMessageEn = closedMessage?.messageEn && closedMessage?.messageEn !== "";
    const hasClosedMessageFr = closedMessage?.messageFr && closedMessage?.messageFr !== "";

    // Ensure that both languages have a message if one of them has a message
    if (hasClosedMessageEn || hasClosedMessageFr) {
      if (!hasClosedMessageEn) return false;
      if (!hasClosedMessageFr) return false;
    }

    return true;
  }, [closedMessage]);

  const [status, setStatus] = useState(closingDate ? "closed" : "open");
  const [showDateTimeDialog, setShowDateTimeDialog] = useState(false);

  const handleToggle = (value: boolean) => {
    setStatus(value == true ? "closed" : "open");
  };

  const saveFormStatus = useCallback(
    async (futureDate?: number) => {
      let closeDate = "open";

      if (status === "closed") {
        const date = futureDate ? new Date(futureDate) : new Date();
        closeDate = date.toISOString();
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
    },
    [status, formId, setClosingDate, t, closedMessage]
  );

  return (
    <div className="mb-10">
      <h2>{t("closingDate.title")}</h2>
      <h3>{t("closingDate.status")}</h3>
      <p className="mb-6">{t("closingDate.description")}</p>
      <div className="w-3/5">
        <ClosedDateBanner closingDate={closingDate} />
      </div>
      <div className="mb-4">
        <ClosingDateToggle
          isChecked={status === "closed" ? false : true}
          setIsChecked={handleToggle}
          onLabel={t("closingDate.closed")}
          offLabel={t("closingDate.open")}
          description={t("closingDate.status")}
        />
      </div>
      <div className="mb-4">
        <Button
          data-closing-date={closingDate}
          theme="link"
          onClick={() => setShowDateTimeDialog(true)}
        >
          {t("scheduleClosingPage.linkText")}
        </Button>
      </div>
      <div className="mb-4 w-3/5">
        <ClosedMessage
          closedDetails={closedMessage}
          setClosedDetails={setClosedMessage}
          valid={validateClosedMessage()}
        />
      </div>
      <Button
        disabled={!validateClosedMessage()}
        theme="secondary"
        onClick={() => saveFormStatus()}
      >
        {t("closingDate.saveButton")}
      </Button>
      {showDateTimeDialog && (
        <ClosingDateDialog
          showDateTimeDialog={showDateTimeDialog}
          setShowDateTimeDialog={setShowDateTimeDialog}
          save={saveFormStatus}
        ></ClosingDateDialog>
      )}
    </div>
  );
};
