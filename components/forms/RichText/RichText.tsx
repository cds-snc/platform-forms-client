import React from "react";
import classnames from "classnames";
import Markdown from "markdown-to-jsx";

interface RichTextProps {
  children?: string | undefined;
  id?: string;
  className?: string;
}

export const RichText = (props: RichTextProps): React.ReactElement | null => {
  const { children, className, id } = props;
  if (!children) {
    return null;
  }

  const classes = classnames("gc-richText", className);
  return (
    <div data-testid="richText" className={classes} id={id}>
      <Markdown options={{ forceBlock: true }}>{children}</Markdown>
    </div>
  );
};

export default RichText;
