import React from "react";
import classnames from "classnames";

interface RichTextProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const RichText = (props: RichTextProps): React.ReactElement => {
  const { children, className, id } = props;

  const classes = classnames("gc-richText", className);

  return (
    <p data-testid="richText" className={classes} id={id}>
      {children}
    </p>
  );
};

export default RichText;
