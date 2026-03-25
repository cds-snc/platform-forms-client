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

  const childrenElements = (
    <>
      {children}
      {required && (
        <span className="label--required" data-testid="required" aria-hidden>
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
    // Work around for Chrome+TalkBack double announce.
    // See #5846 and https://adrianroselli.com/2022/07/use-legend-and-fieldset.html
    // aria-hidden on <legend> prevents TalkBack from navigating to it as a standalone
    // content node. Chrome still uses it to compute the fieldset's accessible name.
    <>
      <legend aria-hidden="true" data-testid="label" className={"visually-hidden"} id={id}>
        {childrenElements}
      </legend>
      <div aria-hidden="true" className={classes}>
        {childrenElements}
      </div>
    </>
  ) : (
    <label data-testid="label" className={classes} htmlFor={htmlFor} id={id}>
      {childrenElements}
    </label>
  );
};
