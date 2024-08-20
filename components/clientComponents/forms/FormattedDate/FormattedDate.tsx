"use client";
import { InputFieldProps } from "@lib/types";
import classnames from "classnames";
import { useField } from "formik";
import React, { useEffect, useState } from "react";
import { Description } from "../Description/Description";
import { useTranslation } from "@i18n/client";
import { DateFormat, DateObject, DatePart } from "./types";

interface FormattedDateProps extends InputFieldProps {
  dateFormat?: DateFormat;
  monthSelector?: "numeric" | "select";
  defaultDate?: string | null;
  autocomplete?: string;
  description?: string;
}

export const FormattedDate = (props: FormattedDateProps): React.ReactElement => {
  const {
    id,
    name,
    label,
    description,
    required,
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
    <fieldset
      role="group"
      aria-describedby={description ? `desc-${id}` : undefined}
      data-testid="formattedDate"
    >
      <legend className="gc-label">{label}</legend>
      {description && <Description id={`desc-${id}`}>{description}</Description>}

      <div className="flex gap-2">
        <input
          type="hidden"
          {...field}
          value={JSON.stringify(getDateObject(selectedYear, selectedMonth, selectedDay))}
        />
        {dateParts.map((part) => {
          return part === DatePart.MM && monthSelector === "select" ? (
            <div key={part}>
              <label htmlFor={`${name}-${part}`}>{t(`formattedDate.${part}`)}</label>
              <select
                name={`${name}-${part}`}
                id={`${name}-${part}`}
                className="gc-dropdown w-36"
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                required={required}
                data-testid="month-select"
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
              <label htmlFor={`${name}-${part}`}>{t(`formattedDate.${part}`)}</label>
              <input
                name={`${name}-${part}`}
                id={`${name}-${part}`}
                type="number"
                min={1}
                max={12}
                autoComplete={autocomplete ? "bday-month" : undefined}
                className={classnames("gc-input-text", "w-16")}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                required={required}
                data-testid="month-number"
              />
            </div>
          ) : part === DatePart.YYYY ? (
            <div key={part} className="flex flex-col">
              <label htmlFor={`${name}-${part}`}>{t(`formattedDate.${part}`)}</label>
              <input
                name={`${name}-${part}`}
                id={`${name}-${part}`}
                type="number"
                min={1900}
                autoComplete={autocomplete ? "bday-year" : undefined}
                className={classnames("gc-input-text", "w-28")}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                required={required}
                data-testid="year-number"
              />
            </div>
          ) : (
            <div key={part} className="flex flex-col">
              <label htmlFor={`${name}-${part}`}>{t(`formattedDate.${part}`)}</label>
              <input
                name={`${name}-${part}`}
                id={`${name}-${part}`}
                type="number"
                min={1}
                max={getMaxDay(selectedMonth, selectedYear)}
                autoComplete={autocomplete ? "bday-day" : undefined}
                className={classnames("gc-input-text", "w-16")}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                required={required}
                data-testid="day-number"
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
