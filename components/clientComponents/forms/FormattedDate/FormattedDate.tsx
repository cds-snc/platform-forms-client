"use client";
import { InputFieldProps } from "@lib/types";
import { useField } from "formik";
import React, { useEffect, useState } from "react";
import { Description } from "../Description/Description";
import { useTranslation } from "@i18n/client";
import { DateFormat, DateObject, DatePart } from "./types";
import { getMaxMonthDay } from "./utils";
import { ErrorMessage } from "@clientComponents/forms";
import { cn } from "@lib/utils";

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

  const [dateObject, setDateObject] = useState<DateObject | null>(null);
  const [field, meta, helpers] = useField(props);
  const { t } = useTranslation("common");

  // Create an array of date parts in the order they should be displayed
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

  // Update the date object when the field value changes
  useEffect(() => {
    if (field.value) {
      try {
        const parsedValue = JSON.parse(field.value);
        setDateObject(parsedValue);
      } catch (e) {
        setDateObject(null);
      }
    }
  }, [field.value]);

  // Update the field value when the date object changes
  useEffect(() => {
    if (dateObject) {
      helpers.setValue(JSON.stringify(dateObject));
    } else {
      helpers.setValue("");
    }
  }, [dateObject, helpers]);

  const setSelectedYear = (year: string) =>
    setDateObject((prev) => {
      const newObj = { ...prev };
      if (year === "") {
        delete newObj.YYYY;
      } else {
        newObj.YYYY = Number(year);
      }
      return newObj as DateObject;
    });
  const setSelectedMonth = (month: string) =>
    setDateObject((prev) => {
      const newObj = { ...prev };
      if (month === "") {
        delete newObj.MM;
      } else {
        newObj.MM = Number(month);
      }
      return newObj as DateObject;
    });
  const setSelectedDay = (day: string) =>
    setDateObject((prev) => {
      const newObj = { ...prev };
      if (day === "") {
        delete newObj.DD;
      } else {
        newObj.DD = Number(day);
      }
      return newObj as DateObject;
    });

  return (
    <fieldset
      role="group"
      aria-describedby={description ? `desc-${id}` : undefined}
      data-testid="formattedDate"
      id={id}
    >
      <legend className={cn("gc-label", required && "required")}>
        {label}
        {required && (
          <span data-testid="required" aria-hidden>
            {" "}
            ({t("required")})
          </span>
        )}
      </legend>
      {description && <Description id={id}>{description}</Description>}
      {meta.error && <ErrorMessage id={"errorMessage" + id}>{meta.error}</ErrorMessage>}
      <div className="flex gap-2">
        <input type="hidden" {...field} />
        {dateParts.map((part) => {
          // Not currently an option, for future use
          return part === DatePart.MM && monthSelector === "select" ? (
            <div key={part}>
              <label htmlFor={`${name}-${part}`}>{t(`formattedDate.${part}`)}</label>
              <select
                name={`${name}-${part}`}
                id={`${name}-${part}`}
                className={cn("gc-dropdown", "w-36", meta.error && "gc-error-input")}
                onChange={(e) => setSelectedMonth(e.target.value)}
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
                className={cn("gc-input-text", "w-16", meta.error && "gc-error-input")}
                value={dateObject?.MM || ""}
                onChange={(e) => setSelectedMonth(e.target.value)}
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
                className={cn("gc-input-text", "w-28", meta.error && "gc-error-input")}
                value={dateObject?.YYYY || ""}
                onChange={(e) => setSelectedYear(e.target.value)}
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
                max={
                  dateObject?.MM && dateObject?.YYYY
                    ? getMaxMonthDay(dateObject.MM, dateObject.YYYY)
                    : 31
                }
                autoComplete={autocomplete ? "bday-day" : undefined}
                className={cn("gc-input-text", "w-16", meta.error && "gc-error-input")}
                value={dateObject?.DD || ""}
                onChange={(e) => setSelectedDay(e.target.value)}
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
