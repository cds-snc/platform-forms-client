import React, { Children } from "react";
import classnames from "classnames";

interface DescriptionProps {
  children: string | undefined;
  id?: string;
  className?: string;
}

export const Description = (props: DescriptionProps): React.ReactElement => {
  const { children, className, id } = props;

  const classes = classnames("gc-description", className);
  const descriptions = children ? children.split("<br>") : [];

  return (
    <div id={`desc-${id}`}>
      {descriptions.map((child, index) => {
        return (
          <p data-testid="description" className={classes} key={index}>
            {child}
          </p>
        );
      })}
    </div>
  );
};

export default Description;
