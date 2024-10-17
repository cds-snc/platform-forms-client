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
        <p className="mb-2 font-bold">{t("scheduleClosingPage.dialog.text1")}</p>
        <p className="mb-2"></p>
        <div>
          <div className="mb-4 flex gap-10">
            <fieldset role="group" aria-label="Date picker">
              <legend className="mb-4">{t("scheduleClosingPage.dialog.text2")}</legend>
              <div className="inline-flex gap-2">
                <div className="gcds-input-wrapper !mr-2 flex flex-col">
                  <label className="mb-2" htmlFor="date-picker-month">
                    {t("scheduleClosingPage.dialog.datePicker.month")}
                  </label>
                  <input
                    name="date-picker-month"
                    id="date-picker-month"
                    type="number"
                    min={1}
                    max={12}
                    className={"!w-16"}
                    // onChange={(e) => setSelectedMonth(e.target.value)}
                    required
                    data-testid="date-picker-month"
                  />
                </div>
                <div className="gcds-input-wrapper !mr-2 flex flex-col">
                  <label className="!mr-2 mb-2" htmlFor="date-picker-day">
                    {t("scheduleClosingPage.dialog.datePicker.day")}
                  </label>
                  <input
                    name="date-picker-day"
                    id="date-picker-day"
                    type="number"
                    min={1}
                    // max={
                    //   dateObject?.MM && dateObject?.YYYY
                    //     ? getMaxMonthDay(dateObject.MM, dateObject.YYYY)
                    //     : 31
                    // }
                    className={"!w-16 !mr-2"}
                    // onChange={(e) => setSelectedDay(e.target.value)}
                    required
                    data-testid="date-picker-day"
                  />
                </div>
                <div className="gcds-input-wrapper !mr-2 !flex !flex-col">
                  <label className="mb-2" htmlFor="date-picker-year">
                    {t("scheduleClosingPage.dialog.datePicker.year")}
                  </label>
                  <input
                    name="date-picker-year"
                    id="date-picker-year"
                    type="number"
                    min={1900}
                    className={"!w-28"}
                    // onChange={(e) => setSelectedYear(e.target.value)}
                    required
                    data-testid="date-picker-year"
                  />
                </div>
              </div>
            </fieldset>
          </div>

          <div className="gcds-input-wrapper !mr-2 !flex !flex-col">
            <label htmlFor="time-picker" className="mb-2 font-bold">
              {t("scheduleClosingPage.dialog.timePicker.text1")}
            </label>
            <p id="time-picker-description" className="mb-4">
              {t("scheduleClosingPage.dialog.timePicker.text2")}
            </p>
            <input
              id="time-picker"
              name="time-picker"
              role="time"
              aria-describedby="time-picker-description"
              placeholder="00:00"
              required
              className="!w-20"
            />
          </div>
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
