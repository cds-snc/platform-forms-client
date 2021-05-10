import React from "react";
import classnames from "classnames";
import { useTranslation } from "next-i18next";

interface LabelProps {
  children: React.ReactNode;
  htmlFor: string;
  id?: string;
  className?: string;
  error?: boolean;
  hint?: React.ReactNode;
  srOnly?: boolean;
  required?: boolean;
}

export const Label = (props: LabelProps): React.ReactElement => {
  const { children, htmlFor, className, error, hint, srOnly, required, id } = props;

  const classes = classnames(
    {
      "gc-label": !srOnly,
      "gc-sr-only": srOnly,
      "gc-label--error": error,
    },
    className
  );

  const { t } = useTranslation("common");

  return (
    <label data-testid="label" className={classes} htmlFor={htmlFor} id={id}>
      {children} {required ? <span aria-hidden>*</span> : null}
      {required ? <i className="visually-hidden">{t("required-field")}</i> : null}
      {hint && <span className="gc-hint">{hint}</span>}
    </label>
  );
};

export default Label;
