"use client";
import React from "react";
import { useField } from "formik";
import { useTranslation } from "@i18n/client";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { cn } from "@lib/utils";
import { orderChoices } from "@lib/utils/orderChoices";

interface DropdownProps extends InputFieldProps {
  children?: React.ReactElement;
  choices?: string[];
  sortOrder?: string;
}

interface DropdownOptionProps {
  id: string;
  name: string;
  value: string;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return (
    <option id={props.id} value={props.value}>
      {props.name}
    </option>
  );
};

export const Dropdown = (props: DropdownProps): React.ReactElement => {
  const {
    children,
    id,
    name,
    className,
    choices = [],
    required,
    ariaDescribedBy,
    lang,
    sortOrder,
  } = props;
  const { t } = useTranslation("common", { lng: lang });
  const [field, meta] = useField(props);

  const initialDropdownOption = <option value="">{t("dropdown-initial-option-text")}</option>;

  const options = orderChoices(id, choices, sortOrder).map(({ choice, innerId }) => (
    <DropdownOption id={innerId} key={`key-${innerId}`} value={choice} name={choice} />
  ));

  const classes = cn("gc-dropdown", className, meta.error && "gcds-error");

  const errorMessageId = `errorMessage${id}`;
  // No character count so avoiding ariaDescribedByIds()
  const describedByIds = [meta.error ? errorMessageId : undefined, ariaDescribedBy]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("gcds-select-wrapper", meta.error && "gcds-error")}>
      {meta.error && <ErrorMessage id={errorMessageId}>{meta.error}</ErrorMessage>}
      <select
        data-testid="dropdown"
        className={classes}
        id={id}
        {...(name && { name })}
        aria-required={required ? "true" : undefined}
        aria-invalid={meta.error ? "true" : undefined}
        aria-describedby={describedByIds || undefined}
        {...field}
      >
        {children ? (
          children
        ) : (
          <>
            {initialDropdownOption}
            {options}
          </>
        )}
      </select>
    </div>
  );
};
