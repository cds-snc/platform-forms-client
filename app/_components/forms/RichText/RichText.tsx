import React from "react";
import classnames from "classnames";
import Markdown from "markdown-to-jsx";

interface RichTextProps {
  children?: string | undefined;
  id?: string;
  className?: string;
  lang?: string;
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
  type ObjectKey = keyof typeof props;
  const href = "href" as ObjectKey;
  const target = (props[href] as string).startsWith("#") ? "_self" : "_blank";
  return (
    <a {...props} target={target}>
      {children}
    </a>
  );
};

const Table = ({ children, ...props }: { children: React.ReactElement }) => {
  return (
    <table {...props} className="border-1 border-black-default">
      {children}
    </table>
  );
};

const TableTH = ({ children, ...props }: { children: React.ReactElement }) => {
  return (
    <th {...props} className="p-2 border-1 border-black-default">
      {children}
    </th>
  );
};

const TableTD = ({ children, ...props }: { children: React.ReactElement }) => {
  return (
    <td {...props} className="p-2 border-1 border-black-default">
      {children}
    </td>
  );
};

export const RichText = (props: RichTextProps): React.ReactElement | null => {
  const { children, className, id, lang } = props;

  if (!children) {
    return null;
  }

  const classes = classnames("gc-richText", className);
  return (
    <div data-testid="richText" className={classes} id={id} {...(lang && { lang: lang })}>
      <Markdown
        options={{
          forceBlock: true,
          disableParsingRawHTML: true,
          overrides: {
            h1: { component: H1 },
            a: { component: A },
            table: { component: Table },
            th: { component: TableTH },
            td: { component: TableTD },
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
};
