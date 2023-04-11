import React from "react";
import classnames from "classnames";

export interface DescriptionProps {
  children: string | undefined;
  id?: string;
  className?: string;
}

export const Description = (props: DescriptionProps): React.ReactElement => {
  const { children, className, id } = props;

  const classes = classnames("gc-description", className);
  return (
    <div id={`desc-${id}`} className={classes} data-testid="description">
      {children &&
        children.split("<br>").map((child, index, childrenArray) => {
          return (
            <React.Fragment key={index}>
              {child}
              {index !== childrenArray.length - 1 && <br />}
            </React.Fragment>
          );
        })}
    </div>
  );
};

export default Description;
