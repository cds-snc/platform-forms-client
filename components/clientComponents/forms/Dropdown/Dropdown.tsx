"use client";
import React from "react";
import { useField } from "formik";
import { useTranslation } from "@i18n/client";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { cn } from "@lib/utils";

interface DropdownProps extends InputFieldProps {
  children?: React.ReactElement;
  choices?: string[];
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
  const { children, id, name, className, choices = [], required, ariaDescribedBy } = props;
  const { t } = useTranslation("common");
  const [field, meta] = useField(props);

  const initialDropdownOption = <option value="">{t("dropdown-initial-option-text")}</option>;

  const options = choices.map((choice, i) => {
    const innerId = `${id}.${i}`;
    return <DropdownOption id={innerId} key={`key-${innerId}`} value={choice} name={choice} />;
  });

  const classes = cn("gc-dropdown", className, meta.error && "gcds-error");

  return (
    <div className="gcds-select-wrapper">
      {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
      <select
        data-testid="dropdown"
        className={classes}
        id={id}
        {...(name && { name })}
        required={required}
        aria-describedby={ariaDescribedBy}
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
