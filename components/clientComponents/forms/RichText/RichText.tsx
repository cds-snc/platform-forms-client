"use client";
import React from "react";
import { cn } from "@lib/utils";
import Markdown, { RuleType } from "markdown-to-jsx";
import { stripEntities } from "@lib/utils/strings";

interface RichTextProps {
  children?: string | undefined;
  id?: string;
  className?: string;
  lang?: string;
}

type MarkdownBlock =
  { type: "markdown"; content: string } | { type: "collapsible"; summary: string; content: string };

const splitCollapsibleBlocks = (markdown: string): MarkdownBlock[] => {
  const lines = markdown.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let markdownLines: string[] = [];

  const flushMarkdown = () => {
    if (markdownLines.length > 0) {
      blocks.push({ type: "markdown", content: markdownLines.join("\n") });
      markdownLines = [];
    }
  };

  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(/^:::collapsible(?:\s+(.*))?\s*$/);
    if (!match) {
      markdownLines.push(lines[index]);
      continue;
    }

    const endIndex = lines.slice(index + 1).findIndex((line) => /^:::\s*$/.test(line));
    if (endIndex === -1) {
      markdownLines.push(lines[index]);
      continue;
    }

    flushMarkdown();
    const closingIndex = index + endIndex + 1;
    blocks.push({
      type: "collapsible",
      summary: match[1]?.trim() || "Details",
      content: lines.slice(index + 1, closingIndex).join("\n"),
    });
    index = closingIndex;
  }

  flushMarkdown();
  return blocks;
};

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
    <table {...props} className="border-black-default border-1">
      {children}
    </table>
  );
};

const TableTH = ({ children, ...props }: { children: React.ReactElement }) => {
  return (
    <th {...props} className="border-black-default border-1 p-2">
      {children}
    </th>
  );
};

const TableTD = ({ children, ...props }: { children: React.ReactElement }) => {
  return (
    <td {...props} className="border-black-default border-1 p-2">
      {children}
    </td>
  );
};

const markdownOptions = {
  forceBlock: true,
  disableParsingRawHTML: true,
  renderRule(next: (node: unknown) => React.ReactNode, node: { type: string; text?: string }) {
    if (node.type === RuleType.text) {
      return stripEntities(node.text || "");
    }
    return next(node);
  },
  overrides: {
    h1: { component: H1 },
    a: { component: A },
    table: { component: Table },
    th: { component: TableTH },
    td: { component: TableTD },
  },
};

const MarkdownContent = ({ content }: { content: string }): React.ReactElement | null => {
  const blocks = splitCollapsibleBlocks(content);

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "collapsible") {
          return (
            <details key={`collapsible-${index}`} open>
              <summary>{stripEntities(block.summary)}</summary>
              <div className="gc-details-content">
                <MarkdownContent content={block.content} />
              </div>
            </details>
          );
        }

        return block.content ? (
          <Markdown key={`markdown-${index}`} options={markdownOptions}>
            {block.content}
          </Markdown>
        ) : null;
      })}
    </>
  );
};

export const RichText = (props: RichTextProps): React.ReactElement | null => {
  const { children, className, id, lang } = props;

  if (!children) {
    return null;
  }

  const classes = cn("gc-richText", className);

  return (
    <div data-testid="richText" className={classes} id={id} {...(lang && { lang: lang })}>
      <MarkdownContent content={children} />
    </div>
  );
};
