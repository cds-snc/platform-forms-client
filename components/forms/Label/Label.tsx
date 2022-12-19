import React from "react";
import classnames from "classnames";
import { useTranslation } from "next-i18next";
import { ValidationProperties } from "@lib/types";

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  id?: string;
  className?: string;
  error?: boolean;
  hint?: React.ReactNode;
  srOnly?: boolean;
  required?: boolean;
  validation?: ValidationProperties;
  group?: boolean;
}

export const Label = (props: LabelProps): React.ReactElement => {
  const { children, htmlFor, className, error, hint, srOnly, required, validation, id, group } =
    props;

  const classes = classnames(
    {
      "gc-label": !srOnly,
      "gc-sr-only": srOnly,
      "gc-label--error": error,
    },
    className
  );

  const { t } = useTranslation("common");

  const childrenElements = (
    <>
      {children}
      {required && (
        <span data-testid="required" aria-hidden>
          {" "}
          ({validation?.all ? t("all-required") : t("required")})
        </span>
      )}
      {group && required && (
        <i className="visually-hidden">
          {validation?.all ? t("all-required") : t("required-field")}
        </i>
      )}
      {hint && <span className="gc-hint">{hint}</span>}
    </>
  );

  return group ? (
    <legend data-testid="label" className={classes} id={id}>
      {childrenElements}
    </legend>
  ) : (
    <label data-testid="label" className={classes} htmlFor={htmlFor} id={id}>
      {childrenElements}
    </label>
  );
};
