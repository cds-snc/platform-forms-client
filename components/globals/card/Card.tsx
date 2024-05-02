import React from "react";

export enum HeadingLevel {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  H5 = "h5",
  H6 = "h6",
}

export const Card = ({
  children,
  icon,
  title,
  content,
  headingTag: HeadingTag = HeadingLevel.H2,
  headingStyle,
}: {
  children?: React.ReactNode;
  icon?: JSX.Element;
  title?: string;
  content?: string;
  headingTag?: HeadingLevel;
  headingStyle?: string;
}) => {
  return (
    <div className="inline-flex justify-between rounded-lg border-2 border-solid border-[#ebf0f4] p-4">
      {icon && <div>{icon}</div>}
      <div className="mx-8 mt-4 flex flex-col justify-start">
        {children && children}
        {!children && (
          <>
            {title && <HeadingTag className={headingStyle}>{title}</HeadingTag>}
            {content && <p>{content}</p>}
          </>
        )}
      </div>
    </div>
  );
};
