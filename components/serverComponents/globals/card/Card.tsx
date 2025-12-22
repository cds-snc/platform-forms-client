import React, { type JSX } from "react";
import { HeadingLevel } from "@lib/constants";

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
    <div className="inline-flex justify-between rounded-lg border-2 border-solid border-[#ebf0f4] bg-white p-4">
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
