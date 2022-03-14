import React from "react";
import classnames from "classnames";
import Markdown from "markdown-to-jsx";

interface RichTextProps {
  children?: string | undefined;
  id?: string;
  className?: string;
}

// override the default h1 element such that to place a tabindex value of -1 to make it
// able to be programmatically focusable
const H1 = ({ children, ...props }: { children: React.ReactElement }) => {
  return (
    <h1 {...props} tabIndex={-1}>
      {children}
    </h1>
  );
};

export const RichText = (props: RichTextProps): React.ReactElement | null => {
  const { children, className, id } = props;
  if (!children) {
    return null;
  }

  const classes = classnames("gc-richText", className);
  return (
    <div data-testid="richText" className={classes} id={id}>
      <Markdown options={{ forceBlock: true, overrides: { h1: { component: H1 } } }}>
        {children
          .replace(/<br>/g, `${String.fromCharCode(10)}`)
          .replace(/href/g, "rel='noreferrer' target='_blank' href")}
      </Markdown>
    </div>
  );
};

export default RichText;
