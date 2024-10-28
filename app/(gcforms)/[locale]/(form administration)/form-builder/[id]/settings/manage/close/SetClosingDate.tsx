"use client";
import React, { useCallback, useEffect, useState } from "react";
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

import { ScheduledClosingDate } from "./ScheduledClosingDate";
import { dateHasPast } from "@lib/utils";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { isFutureDate } from "@lib/utils/date/isFutureDate";

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

  const [status, setStatus] = useState(
    dateHasPast(Date.parse(closingDate || "")) ? "closed" : "open"
  );

  // Needed to sync the status with the closing date
  useEffect(() => {
    setStatus(dateHasPast(Date.parse(closingDate || "")) ? "closed" : "open");
  }, [closingDate]);

  const [showDateTimeDialog, setShowDateTimeDialog] = useState(false);

  const handleToggle = (value: boolean) => {
    setStatus(value == true ? "closed" : "open");
  };

  // Called from the date scheduling modal
  const saveFutureDate = useCallback(
    async (futureDate?: number) => {
      if (!futureDate) {
        return;
      }

      const closingDate = new Date(futureDate).toISOString();

      if (closingDate === undefined) {
        return;
      }

      const result = await closeForm({
        id: formId,
        closingDate,
        closedDetails: closedMessage,
      });

      if (!result || result.error) {
        toast.error(t("closingDate.savedErrorMessage"));
        return;
      }

      // Update the local template store
      setClosingDate(closingDate);

      toast.success(t("closingDate.savedSuccessMessage"));
    },
    [formId, setClosingDate, t, closedMessage]
  );

  const saveFormStatus = useCallback(async () => {
    if (closingDate === undefined) {
      return;
    }

    // Check to see if the existing date is in the past when updating the toggle. If the date is in
    // the future we want to keep the existing value.
    let closeDate = isFutureDate(String(closingDate)) ? closingDate : null;

    if (status === "closed") {
      // Set date to now to close the form right away
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

    // Setting local store
    setClosingDate(closeDate);

    if (status === "closed") {
      toast.success(<ClosedSuccess />, "wide");
    } else {
      toast.success(t("closingDate.savedSuccessMessage"));
    }
  }, [status, formId, setClosingDate, t, closedMessage, closingDate]);

  const { getFlag } = useFeatureFlags();
  const hasScheduleClosingDate = getFlag("scheduleClosingDate");

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
        {hasScheduleClosingDate && closingDate && (
          <ScheduledClosingDate closingDate={closingDate} language="en" />
        )}

        {hasScheduleClosingDate && (
          <Button
            data-closing-date={closingDate}
            theme="link"
            onClick={() => setShowDateTimeDialog(true)}
          >
            {t("scheduleClosingPage.linkText")}
          </Button>
        )}
      </div>
      <div className="mb-4 w-3/5">
        <ClosedMessage
          closedDetails={closedMessage}
          setClosedDetails={setClosedMessage}
          valid={validateClosedMessage()}
        />
      </div>
      <Button disabled={!validateClosedMessage()} theme="secondary" onClick={saveFormStatus}>
        {t("closingDate.saveButton")}
      </Button>
      {showDateTimeDialog && (
        <ClosingDateDialog
          showDateTimeDialog={showDateTimeDialog}
          setShowDateTimeDialog={setShowDateTimeDialog}
          save={saveFutureDate}
          closingDate={closingDate}
        />
      )}
    </div>
  );
};
