import { getMaxMonthDay } from "@clientComponents/forms/FormattedDate/utils";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useTranslation } from "@i18n/client";
import { logMessage } from "@lib/logger";
import { useEffect, useState } from "react";

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
  const [dateTime, setDateTime] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [day, setDay] = useState<number | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);

  const handleClose = () => {
    setShowDateTimeDialog(false);
    dialogRef.current?.close();
  };

  const handleSave = () => {
    // todo validate date
    save(dateTime);
    // if valid then
    handleClose();
  };

  const handleSetTime = (time: string) => {
    if (!isValidTime(time)) {
      // TODO show an error
      return;
    }
    setTime(time);
  };

  // TODO Move to lib - sorry can't escpate the regex :)
  // TODO update to make first digit optional, so no need to prefix with 0
  function isValidTime(time: string) {
    return /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/.test(time);
  }

  useEffect(() => {
    if (month && day && year && time) {
      const hours = Number(time.split(":")[0]);
      const minutes = Number(time.split(":")[1]);

      // TODO: Wrong date
      const date = new Date(year, month - 1, day, hours, minutes);
      setDateTime(date.getTime());

      logMessage.info("TEMP: closing date at " + date.getUTCDate());
    }
  }, [month, day, year, time]);

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
        <div>
          <div className="mb-4">
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
                    onChange={(e) => setMonth(Number(e.target.value))}
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
                    max={month && year ? getMaxMonthDay(month, year) : 31}
                    className={"!w-16 !mr-2"}
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
                    name="date-picker-year"
                    id="date-picker-year"
                    type="number"
                    min={new Date().getFullYear()}
                    className={"!w-28"}
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
              id="time-picker"
              name="time-picker"
              role="time"
              aria-describedby="time-picker-description"
              minLength={5}
              maxLength={5}
              onChange={(e) => handleSetTime(e.target.value)}
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
          <Button theme="primary" onClick={handleSave}>
            {t("scheduleClosingPage.dialog.save")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
