"use client";
import { InputFieldProps } from "@lib/types";
import classnames from "classnames";
import { useField } from "formik";
import React from "react";
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
    className,
    required,
    ariaDescribedBy,
    dateParts = [DatePart.YYYY, DatePart.MM, DatePart.DD],
  } = props;

  const { t } = useTranslation("common");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [field, meta, helpers] = useField(props);

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
              <select name={`${name}-${part}`} className="gc-dropdown w-36">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {t(`formattedDate.months.${month}`)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div key={part} className="flex flex-col">
              <label>{t(`formattedDate.${part}`)}</label>
              <input
                name={`${name}-${part}`}
                type="number"
                min={part === DatePart.YYYY ? 1900 : 1}
                max={part === DatePart.MM ? 12 : part === DatePart.YYYY ? undefined : 31}
                className={classnames("gc-input-text", part === DatePart.YYYY ? "w-28" : "w-16")}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
