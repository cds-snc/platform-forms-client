import React from "react";
import classnames from "classnames";
import { useField } from "formik";
import { ErrorMessage } from "@components/forms";
import { InputFieldProps } from "@lib/types";

// NOTE: based on forms/Dropdown. This will allow us to customize the dropdown without worry of
// accidentally modifying a forms-form select

// TODO: probably remove Formik related stuff like useField

interface SelectProps extends InputFieldProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  ariaDescribedBy?: string;
  required?: boolean;
}

export const Select = (props: SelectProps): React.ReactElement => {
  const { children, id, className, required = false, ariaDescribedBy } = props;
  const classes = classnames("gc-dropdown", className);
  const [field, meta] = useField(props);
  return (
    <>
      {meta.touched && meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

      <select
        id={id}
        data-testid={`dropdown-${id}`}
        className={classes}
        required={required}
        {...(ariaDescribedBy && { ariaDescribedBy: ariaDescribedBy })}
        {...field}

        // NOTE: onChange will take you down a Formik rabbit hole - probably wait until refactoring
        // Formik out. I could find a way but it was not simple.
        // {...(onChange && {onChange: onChange})}
      >
        {children}
      </select>
    </>
  );
};
