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

const A = ({ children, ...props }: { children: React.ReactElement }) => {
  return (
    <a {...props} target="_blank">
      {children}
    </a>
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
      <Markdown
        options={{
          forceBlock: true,
          disableParsingRawHTML: true,
          overrides: { h1: { component: H1 }, a: { component: A } },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
};
