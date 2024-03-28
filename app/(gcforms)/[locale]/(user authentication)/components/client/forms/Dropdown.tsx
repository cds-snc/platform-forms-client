import React from "react";
import classnames from "classnames";
import { useTranslation } from "@i18n/client";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";

interface DropdownProps extends InputFieldProps {
  children?: React.ReactElement;
  choices?: string[];
  validationError?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
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
    validationError,
    onChange,
  } = props;
  const { t } = useTranslation("common");
  const classes = classnames("gc-dropdown", className);

  const initialDropdownOption = <option value="">{t("dropdown-initial-option-text")}</option>;

  const options = choices.map((choice, i) => {
    const innerId = `${id}.${i}`;
    return <DropdownOption id={innerId} key={`key-${innerId}`} value={choice} name={choice} />;
  });

  return (
    <>
      {validationError && <ErrorMessage>{validationError}</ErrorMessage>}

      <select
        data-testid="dropdown"
        className={classes}
        id={id}
        {...(name && { name })}
        required={required}
        aria-describedby={ariaDescribedBy}
        onChange={onChange}
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
    </>
  );
};
