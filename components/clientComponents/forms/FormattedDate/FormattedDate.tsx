"use client";
import { InputFieldProps } from "@lib/types";
import classnames from "classnames";
import { useField } from "formik";
import React, { useState } from "react";
import { Description } from "../Description/Description";
import { useTranslation } from "@i18n/client";

export enum DatePart {
  DD = "day",
  MM = "month",
  YYYY = "year",
}

interface FormattedDateProps extends InputFieldProps {
  dateParts: DatePart[];
  monthSelector: "numeric" | "select";
  defaultDate: string; // ??
  autocomplete: "bday" | false;
}

export const FormattedDate = (props: FormattedDateProps): React.ReactElement => {
  const {
    id,
    name,
    required,
    ariaDescribedBy,
    dateParts = [DatePart.YYYY, DatePart.MM, DatePart.DD],
  } = props;

  const { t } = useTranslation("common");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [field, meta, helpers] = useField(props);

  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
        {dateParts.map((part) => {
          return part === DatePart.MM && props.monthSelector === "select" ? (
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
                className={classnames("gc-input-text", "w-16")}
                required={required}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
