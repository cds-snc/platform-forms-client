import React from "react";
import { cn } from "@lib/utils";

export interface DescriptionProps {
  children: string | undefined;
  id?: string;
  className?: string;
}

export const Description = (props: DescriptionProps): React.ReactElement => {
  const { children, className, id } = props;

  const classes = cn("gc-description", className);
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
