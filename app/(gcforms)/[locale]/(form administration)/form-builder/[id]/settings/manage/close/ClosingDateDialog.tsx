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
  const { t } = useTranslation("form-builder-responses");
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
      title={t("closingDateDialog.title")}
      dialogRef={dialogRef}
      handleClose={handleClose}
      className="max-w-[800px]"
    >
      <>
        <h2>TODO</h2>

        <div>
          <label htmlFor="time-picker">Set a time</label>
          <p id="time-picker-description">Timezon is in ES.</p>
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
            {t("closingDateDialog.cancel")}
          </Button>
          <Button theme="primary" onClick={() => save(dateTime)}>
            {t("closingDateDialog.save")}
          </Button>
        </div>
      </>
    </Dialog>
  );
};
