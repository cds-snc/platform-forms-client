import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useTranslation } from "@i18n/client";
import { useState } from "react";

export const ClosingDateDialog = ({
  showDateTimeDialog,
  setShowDateTimeDialog,
  save,
}: {
  showDateTimeDialog: boolean;
  setShowDateTimeDialog: React.Dispatch<React.SetStateAction<boolean>>;
  save: (futureDate?: number) => Promise<void>;
}) => {
  const { t } = useTranslation("form-builder");
  const dialogRef = useDialogRef();
  const [dateTime /*, setDateTime*/] = useState<number | undefined>(undefined);

  const handleClose = () => {
    setShowDateTimeDialog(false);
    dialogRef.current?.close();
  };

  if (!showDateTimeDialog) {
    return null;
  }

  return (
    <Dialog
      title={t("scheduleClosingPage.dialog.title")}
      dialogRef={dialogRef}
      handleClose={handleClose}
      className="max-w-[800px]"
    >
      <div className="p-4">
        <p>{t("scheduleClosingPage.dialog.text1")}</p>
        <p>{t("scheduleClosingPage.dialog.text2")}</p>
        <div>
          <label htmlFor="time-picker">{t("scheduleClosingPage.dialog.timePicker.text1")}</label>
          <p id="time-picker-description">{t("scheduleClosingPage.dialog.timePicker.text2")}</p>
          <input
            id="time-picker"
            name="time-picker"
            type="input"
            role="time"
            aria-describedby=""
            required
          />
        </div>

        <div className="mt-8 flex gap-4">
          <Button theme="secondary" onClick={handleClose}>
            {t("scheduleClosingPage.dialog.cancel")}
          </Button>
          <Button theme="primary" onClick={() => save(dateTime)}>
            {t("scheduleClosingPage.dialog.save")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
