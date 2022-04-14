import React from "react";
import classnames from "classnames";
import { useField } from "formik";
import { useTranslation } from "next-i18next";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface DropdownProps {
  id: string;
  name: string;
  className?: string;
  choices: string[];
  required?: boolean;
  ariaDescribedBy?: string;
}

interface DropdownOptionProps {
  name: string;
  value: string;
}

const DropdownOption = (props: DropdownOptionProps): React.ReactElement => {
  return <option value={props.value}>{props.name}</option>;
};

export const Dropdown = (props: DropdownProps): React.ReactElement => {
  const { id, className, choices, required, ariaDescribedBy } = props;

  const { t } = useTranslation("common");

  const classes = classnames("gc-dropdown", className);

  const [field, meta] = useField(props);

  const initialDropdownOption = <option value="">{t("dropdown-initial-option-text")}</option>;

  const options = choices.map((choice, i) => {
    const innerId = `${id}-${i}`;
    const value = field.value ? field.value[innerId] : field.value;
    return <DropdownOption key={`key-${innerId}`} value={value} name={choice} />;
  });

  return (
    <>
      {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

      <select
        data-testid="dropdown"
        className={classes}
        id={id}
        required={required}
        aria-describedby={ariaDescribedBy}
        {...field}
      >
        {initialDropdownOption}
        {options}
      </select>
    </>
  );
};

export default Dropdown;
