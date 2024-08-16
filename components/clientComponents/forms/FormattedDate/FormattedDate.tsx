"use client";
import { InputFieldProps } from "@lib/types";
import classnames from "classnames";
import { useField } from "formik";
import React, { useEffect, useState } from "react";
import { Description } from "../Description/Description";
import { useTranslation } from "@i18n/client";

export interface DateObject {
  YYYY: number;
  MM: number;
  DD: number;
}

export enum DatePart {
  DD = "day",
  MM = "month",
  YYYY = "year",
}

export type DateFormat = "YYYY-MM-DD" | "DD-MM-YYYY" | "MM-DD-YYYY";

interface FormattedDateProps extends InputFieldProps {
  dateFormat?: DateFormat;
  monthSelector?: "numeric" | "select";
  defaultDate?: string | null;
  autocomplete?: string;
}

/**
 * Utility function to use when rendering a formatted date string
 *
 * @param dateFormat
 * @param dateObject
 * @returns
 */
export const getFormattedDateFromObject = (
  dateFormat: DateFormat,
  dateObject: DateObject
): string => {
  const { YYYY, MM, DD } = dateObject;

  const formattedDate = dateFormat
    .replace("YYYY", YYYY.toString())
    .replace("MM", MM.toString().padStart(2, "0"))
    .replace("DD", DD.toString().padStart(2, "0"));

  return formattedDate;
};

/**
 * This should probably live somewhere else
 * @param dateObject
 * @returns
 */
export const isValidDate = (dateObject: DateObject): boolean => {
  const { YYYY, MM, DD } = dateObject;
  const date = new Date(`${YYYY}-${MM}-${DD}`);
  return date.getFullYear() === YYYY && date.getMonth() + 1 === MM && date.getDate() === DD;
};

export const FormattedDate = (props: FormattedDateProps): React.ReactElement => {
  const {
    id,
    name,
    required,
    ariaDescribedBy,
    dateFormat = "YYYY-MM-DD",
    monthSelector = "numeric",
    autocomplete = false,
  } = props;

  const dateParts = dateFormat.split("-").map((part) => {
    switch (part) {
      case "YYYY":
        return DatePart.YYYY;
      case "MM":
        return DatePart.MM;
      case "DD":
        return DatePart.DD;
      default:
        throw new Error(`Unknown date part: ${part}`);
    }
  });

  const { t } = useTranslation("common");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [field, meta, helpers] = useField(props);

  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(1);

  const getDateObject = (year: number, month: number, day: number): DateObject => {
    return {
      YYYY: year,
      MM: month,
      DD: day,
    } as DateObject;
  };

  useEffect(() => {
    helpers.setValue(getDateObject(selectedYear, selectedMonth, selectedDay));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, selectedDay]);

  const isLeapYear = (year: number) => {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  };

  const getMaxDay = (month: number, year: number) => {
    // Months are 1-indexed
    switch (month) {
      case 2:
        return isLeapYear(year) ? 29 : 28;
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      default:
        return 31;
    }
  };

  return (
    <fieldset aria-describedby={id}>
      {ariaDescribedBy && (
        <Description id={id} className="gc-form-group-context">
          {ariaDescribedBy}
        </Description>
      )}
      <div className="flex gap-2">
        <input
          type="hidden"
          {...field}
          value={JSON.stringify(getDateObject(selectedYear, selectedMonth, selectedDay))}
        />
        {dateParts.map((part) => {
          return part === DatePart.MM && monthSelector === "select" ? (
            <div key={part}>
              <label>{t(`formattedDate.${part}`)}</label>
              <select
                name={`${name}-${part}`}
                className="gc-dropdown w-36"
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                required={required}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {t(`formattedDate.months.${month}`)}
                  </option>
                ))}
              </select>
            </div>
          ) : part === DatePart.MM ? (
            <div key={part} className="flex flex-col">
              <label>{t(`formattedDate.${part}`)}</label>
              <input
                name={`${name}-${part}`}
                type="number"
                min={1}
                max={12}
                autoComplete={autocomplete ? "bday-month" : undefined}
                className={classnames("gc-input-text", "w-16")}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                required={required}
              />
            </div>
          ) : part === DatePart.YYYY ? (
            <div key={part} className="flex flex-col">
              <label>{t(`formattedDate.${part}`)}</label>
              <input
                name={`${name}-${part}`}
                type="number"
                min={1900}
                autoComplete={autocomplete ? "bday-year" : undefined}
                className={classnames("gc-input-text", "w-28")}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                required={required}
              />
            </div>
          ) : (
            <div key={part} className="flex flex-col">
              <label>{t(`formattedDate.${part}`)}</label>
              <input
                name={`${name}-${part}`}
                type="number"
                min={1}
                max={getMaxDay(selectedMonth, selectedYear)}
                autoComplete={autocomplete ? "bday-day" : undefined}
                className={classnames("gc-input-text", "w-16")}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                required={required}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
