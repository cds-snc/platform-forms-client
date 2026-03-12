"use client";
import React from "react";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
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
  lang?: string;
}

export const Label = (props: LabelProps): React.ReactElement => {
  const {
    children,
    htmlFor,
    className,
    error,
    hint,
    srOnly,
    required,
    validation,
    id,
    group,
    lang,
  } = props;

  const classes = cn(
    {
      "gcds-label": !srOnly,
      "gc-sr-only": srOnly,
      "gcds-label--error": error,
    },
    className
  );

  const { t } = useTranslation("common", { lng: lang });

  // Keep the "required" text "visible" to AT since it is used as the "source of truth" for
  // announcing whether a field is required or not. See #6835
  const childrenElements = (
    <>
      {children}
      {required && (
        <span className="label--required" data-testid="required">
          {" "}
          {/* Only Jaws (latest) announces symbols so paranthesis hidden explicitly for screen readers */}
          <span aria-hidden="true">(</span>
          {validation?.all ? t("all-required") : t("required")}
          <span aria-hidden="true">)</span>
        </span>
      )}
      {/* {group && required && (
        <i className="visually-hidden">
          {validation?.all ? t("all-required") : t("required-field")}
        </i>
      )} */}
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
