"use client";
import { InputFieldProps } from "@lib/types";
import { useField } from "formik";
import React, { useEffect, useState } from "react";
import { Description } from "../Description/Description";
import { useTranslation } from "@i18n/client";
import { DateFormat, DateObject, DatePart } from "./types";
import { isValidDateFormat } from "./utils";
import { ErrorMessage } from "@clientComponents/forms";
import { cn } from "@lib/utils";
import { logMessage } from "@lib/logger";

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
    dateFormat: initialDateFormat = "YYYY-MM-DD",
    monthSelector = "numeric",
    autocomplete = false,
  } = props;

  const [field, meta, helpers] = useField(props);
  const [dateObject, setDateObject] = useState<DateObject | null>(
    field.value ? JSON.parse(field.value) : null
  );
  const { t } = useTranslation("common");

  let dateFormat = initialDateFormat;

  if (!isValidDateFormat(dateFormat)) {
    logMessage.info("Invalid date format", { dateFormat });
    dateFormat = "YYYY-MM-DD";
  }

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
        return;
    }
  });

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
      tabIndex={0}
    >
      <legend className={cn("gc-label", required && "required")} id={`label-${id}`}>
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

      <div className="inline-flex gap-2">
        <input type="hidden" {...field} value={field.value || ""} />
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
            <div key={part} className="gcds-input-wrapper !mr-2 flex flex-col">
              <label className="mb-2" htmlFor={`${name}-${part}`}>
                {t(`formattedDate.${part}`)}
              </label>
              <div id={`${id}-description-month`} hidden>
                {t("number")}
              </div>
              <input
                name={`${name}-${part}`}
                id={`${name}-${part}`}
                // Trying removing type=number  for better UX See: #4897
                inputMode="numeric"
                aria-describedby={`${id}-description-month`}
                autoComplete={autocomplete ? "bday-month" : undefined}
                className={cn("!w-16", meta.error && "gc-error-input")}
                value={dateObject?.MM || ""}
                onChange={(e) => setSelectedMonth(e.target.value)}
                required={required}
                data-testid="month-number"
              />
            </div>
          ) : part === DatePart.YYYY ? (
            <div key={part} className="gcds-input-wrapper !mr-2 !flex !flex-col">
              <label className="mb-2" htmlFor={`${name}-${part}`}>
                {t(`formattedDate.${part}`)}
              </label>
              <div id={`${id}-description-year`} hidden>
                {t("number")}
              </div>
              <input
                name={`${name}-${part}`}
                id={`${name}-${part}`}
                // Trying removing type=number for better UX See: #4897
                inputMode="numeric"
                aria-describedby={`${id}-description-year`}
                autoComplete={autocomplete ? "bday-year" : undefined}
                className={cn("!w-28", meta.error && "gc-error-input")}
                value={dateObject?.YYYY || ""}
                onChange={(e) => setSelectedYear(e.target.value)}
                required={required}
                data-testid="year-number"
              />
            </div>
          ) : (
            <div key={part} className="gcds-input-wrapper !mr-2 flex flex-col">
              <label className="!mr-2 mb-2" htmlFor={`${name}-${part}`}>
                {t(`formattedDate.${part}`)}
              </label>
              <div id={`${id}-description-day`} hidden>
                {t("number")}
              </div>
              <input
                name={`${name}-${part}`}
                id={`${name}-${part}`}
                // Trying removing number for better UX See: #4897
                inputMode="numeric"
                aria-describedby={`${id}-description-day`}
                autoComplete={autocomplete ? "bday-day" : undefined}
                className={cn("!w-16 !mr-2", meta.error && "gc-error-input")}
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
