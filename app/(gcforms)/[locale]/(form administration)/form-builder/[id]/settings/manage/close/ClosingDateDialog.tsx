import { getMaxMonthDay } from "@clientComponents/forms/FormattedDate/utils";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useTranslation } from "@i18n/client";
import { useState } from "react";
import { toast } from "@formBuilder/components/shared/Toast";
import { WarningIcon } from "@serverComponents/icons";

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
  const [hasErrors, setHasErrors] = useState(false);

  const [month, setMonth] = useState<number | undefined>(undefined);
  const [day, setDay] = useState<number | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);

  const handleClose = () => {
    setShowDateTimeDialog(false);
    dialogRef.current?.close();
  };

  const handleSave = () => {
    try {
      // Note: Basic client validation is done using native HTML Form validation - below unlikely
      if (!month || !day || !year || !time) {
        throw new Error("Missing required fields");
      }

      const hours = Number(time.split(":")[0]);
      const minutes = Number(time.split(":")[1]);
      const date = new Date(year, month - 1, day, hours, minutes);
      const timestamp = date.getTime();

      if (timestamp < Date.now()) {
        setHasErrors(true);
        return;
      }

      save(timestamp);
      handleClose();
    } catch (error) {
      toast.error(t("closingDate.savedErrorMessage"));
    }
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="p-4">
          <p className="mb-2 font-bold">{t("scheduleClosingPage.dialog.text1")}</p>
          <div>
            <div className="mb-4">
              <fieldset role="group" aria-label="Date picker">
                <legend className="mb-4">{t("scheduleClosingPage.dialog.text2")}</legend>
                <div role="alert">
                  {hasErrors && (
                    <div className="mb-4 text-red-700 flex align-middle">
                      <WarningIcon className="fill-red-800 mr-2" />
                      {t("scheduleClosingPage.dialog.error.notFutureDate")}
                    </div>
                  )}
                </div>
                <div className="inline-flex gap-2">
                  <div className="gcds-select-wrapper !mr-2 flex flex-col">
                    <label className="mb-2" htmlFor="date-picker-month">
                      {t("scheduleClosingPage.dialog.datePicker.month")}
                    </label>
                    <select
                      name="date-picker-month"
                      id="date-picker-month"
                      className={"gc-dropdown"}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      required
                      data-testid="date-picker-month"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {t(`formattedDate.months.${month}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="gcds-input-wrapper !mr-2 flex flex-col">
                    <label className="!mr-2 mb-2" htmlFor="date-picker-day">
                      {t("scheduleClosingPage.dialog.datePicker.day")}
                    </label>
                    <input
                      className={"!w-16 !mr-2"}
                      name="date-picker-day"
                      id="date-picker-day"
                      type="number"
                      min={1}
                      max={month && year ? getMaxMonthDay(month, year) : 31}
                      onChange={(e) => setDay(Number(e.target.value))}
                      required
                      data-testid="date-picker-day"
                    />
                  </div>
                  <div className="gcds-input-wrapper !mr-2 !flex !flex-col">
                    <label className="mb-2" htmlFor="date-picker-year">
                      {t("scheduleClosingPage.dialog.datePicker.year")}
                    </label>
                    <input
                      className={"!w-28"}
                      name="date-picker-year"
                      id="date-picker-year"
                      type="number"
                      min={new Date().getFullYear()}
                      onChange={(e) => setYear(Number(e.target.value))}
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
                className="!w-20"
                id="time-picker"
                name="time-picker"
                role="time"
                aria-describedby="time-picker-description"
                minLength={5}
                maxLength={5}
                onChange={(e) => setTime(e.target.value)}
                placeholder="00:00"
                required
                pattern="^(?:[01][0-9]|2[0-3]):[0-5][0-9]$"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button theme="secondary" onClick={handleClose}>
              {t("scheduleClosingPage.dialog.cancel")}
            </Button>
            <Button theme="primary" type="submit">
              {t("scheduleClosingPage.dialog.save")}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
