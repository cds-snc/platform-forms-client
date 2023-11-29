import React from "react";

export enum HeadingLevel {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  H5 = "h5",
  H6 = "h6",
}

interface CardProps {
  children?: React.ReactNode;
  icon?: JSX.Element;
  title?: string;
  content?: string;
  heading?: HeadingLevel;
  headingStyle?: string;
}

export const Card = (props: CardProps) => {
  const { children, icon, title, content, heading, headingStyle } = props;

  function createTitle(
    heading: HeadingLevel | undefined,
    content: string | undefined
  ): React.JSX.Element {
    if (heading && content) {
      return React.createElement(
        heading,
        { ...(headingStyle && { className: headingStyle }) },
        content
      );
    }

    if (content) {
      return <p className="gc-h2 text-[#748094]">{content}</p>;
    }

    return <></>;
  }

  return (
    <div className="inline-flex justify-between rounded-lg border-2 border-solid border-[#ebf0f4] p-4">
      {icon && <div>{icon}</div>}
      <div className="mx-8 mt-4 flex flex-col justify-start">
        {children && children}
        {!children && (
          <>
            {createTitle(heading, title)}
            {content && <p>{content}</p>}
          </>
        )}
      </div>
    </div>
  );
};
