import React from "react";
import classnames from "classnames";

interface DescriptionProps {
  children: string | undefined;
  id?: string;
  className?: string;
}

export const Description = (props: DescriptionProps): React.ReactElement => {
  const { children, className, id } = props;

  const classes = classnames("gc-description", className);
  return (
    <div id={`desc-${id}`}>
      {children
        ? children.split("<br>").map((child, index) => {
            return (
              <p data-testid="description" className={classes} key={index}>
                {child}
              </p>
            );
          })
        : null}
    </div>
  );
};

export default Description;
