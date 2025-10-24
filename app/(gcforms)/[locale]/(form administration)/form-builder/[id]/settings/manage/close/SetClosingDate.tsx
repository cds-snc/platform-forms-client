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
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingToggleValue, setPendingToggleValue] = useState<boolean | null>(null);
  const dialog = useDialogRef();

  const handleToggle = (value: boolean) => {
    // Store the pending value and show confirmation dialog
    setPendingToggleValue(value);
    setShowConfirmDialog(true);
  };

  const confirmToggle = useCallback(async () => {
    if (pendingToggleValue === null) return;

    const newStatus = pendingToggleValue ? "open" : "closed";
    setStatus(newStatus);

    // If closed, set date to now. If open, clear the closing date.
    const closeDate = newStatus === "closed" ? new Date().toISOString() : null;

    const result = await closeForm({
      id: formId,
      closingDate: closeDate,
      closedDetails: closedMessage,
    });

    if (!result || result.error) {
      // Revert the status on error
      setStatus(newStatus === "closed" ? "open" : "closed");
      toast.error(t("closingDate.savedErrorMessage"));
      setShowConfirmDialog(false);
      setPendingToggleValue(null);
      return;
    }

    // Setting local store
    setClosingDate(closeDate);

    if (newStatus === "closed") {
      toast.success(<ClosedSuccess />, "wide");
    } else {
      toast.success(t("closingDate.savedSuccessMessage"));
    }

    setShowConfirmDialog(false);
    setPendingToggleValue(null);
  }, [pendingToggleValue, formId, closedMessage, setClosingDate, t]);

  const cancelToggle = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingToggleValue(null);
  }, []);

  const saveClosedMessage = useCallback(
    async (detailsToSave?: ClosedDetails) => {
      const messageToSave = detailsToSave || closedMessage;

      // Update the parent state with the fresh data
      if (detailsToSave) {
        setClosedMessage(detailsToSave);
      }

      // Validate the fresh data directly instead of relying on state
      const hasClosedMessageEn = messageToSave?.messageEn && messageToSave?.messageEn !== "";
      const hasClosedMessageFr = messageToSave?.messageFr && messageToSave?.messageFr !== "";

      let isValid = true;
      if (hasClosedMessageEn || hasClosedMessageFr) {
        if (!hasClosedMessageEn) isValid = false;
        if (!hasClosedMessageFr) isValid = false;
      }

      if (!isValid) return;

      const isoClosingDate = closingDate ? new Date(closingDate).toISOString() : null;

      const result = await closeForm({
        id: formId,
        closingDate: isoClosingDate,
        closedDetails: messageToSave,
      });

      if (!result || result.error) {
        toast.error(t("closingDate.savedErrorMessage"));
        return;
      }

      toast.success(t("closingDate.savedSuccessMessage"));
    },
    [formId, closingDate, closedMessage, t]
  );

  const clearClosingDate = () => {
    closeForm({
      id: formId,
      closingDate: null,
    });
    setClosingDate(null);
    toast.success(t("closingDate.clearSuccessMessage"));
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
      <div className="mb-4" id="closing-date">
        {closingDate && (
          <>
            <ScheduledClosingDate closingDate={closingDate} language="en" />
            <Button theme="primary" onClick={() => setShowDateTimeDialog(true)}>
              {t("scheduleClosingPage.changeOrRemove")}
            </Button>
          </>
        )}

        {!closingDate && (
          <Button
            data-closing-date={closingDate}
            theme="primary"
            onClick={() => setShowDateTimeDialog(true)}
          >
            {t("scheduleClosingPage.linkText")}
          </Button>
        )}
      </div>
      <div className="mb-4 max-w-4xl">
        <ClosedMessage
          closedDetails={closedMessage}
          setClosedDetails={setClosedMessage}
          valid={validateClosedMessage()}
          onSave={saveClosedMessage}
        />
      </div>
      {showDateTimeDialog && (
        <ClosingDateDialog
          showDateTimeDialog={showDateTimeDialog}
          setShowDateTimeDialog={setShowDateTimeDialog}
          save={saveFutureDate}
          clearClosingDate={clearClosingDate}
          closingDate={closingDate}
        />
      )}
      {showConfirmDialog && (
        <Dialog
          handleClose={cancelToggle}
          dialogRef={dialog}
          title={t("closingDate.confirmDialog.title")}
          actions={
            <>
              <Button theme="secondary" onClick={cancelToggle}>
                {t("closingDate.confirmDialog.cancel")}
              </Button>
              <Button theme="primary" onClick={confirmToggle} className="ml-4">
                {t("closingDate.confirmDialog.confirm")}
              </Button>
            </>
          }
        >
          <div className="p-5">
            <p>
              {pendingToggleValue
                ? t("closingDate.confirmDialog.messageOpen")
                : t("closingDate.confirmDialog.messageClosed")}
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
};
