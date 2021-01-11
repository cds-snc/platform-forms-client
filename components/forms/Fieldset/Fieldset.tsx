import React from "react";
import classnames from "classnames";

interface FieldsetProps {
  children: React.ReactNode;
  legend?: React.ReactNode;
  legendSrOnly?: boolean;
  className?: string;
}

export const Fieldset = (props: FieldsetProps): React.ReactElement => {
  const { children, legend, className, legendSrOnly } = props;

  const classes = classnames("gc-fieldset", className);

  const legendClasses = classnames("gc-legend", {
    "gc-sr-only": legendSrOnly,
  });

  return (
    <fieldset data-testid="fieldset" className={classes}>
      {legend && <legend className={legendClasses}>{legend}</legend>}
      {children}
    </fieldset>
  );
};
