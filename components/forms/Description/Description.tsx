import React from "react";
import classnames from "classnames";

interface DescriptionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const Description = (props: DescriptionProps): React.ReactElement => {
  const { children, className, id } = props;

  const classes = classnames("gc-description", className);

  return (
    <p data-testid="description" className={classes} id={id}>
      {children}
    </p>
  );
};

export default Description;
