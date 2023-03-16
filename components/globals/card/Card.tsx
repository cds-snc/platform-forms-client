import React from "react";

interface CardProps {
  children?: React.ReactNode;
  icon?: JSX.Element;
  title?: string;
  content?: string;
}

export const Card = (props: CardProps) => {
  const { children, icon, title, content } = props;

  return (
    <div className="inline-flex justify-between p-4 border-2 border-solid border-[#ebf0f4] rounded-lg">
      {icon && <div>{icon}</div>}
      <div className="flex flex-col justify-center ml-8 mr-8">
        {children && children}
        {!children && (
          <>
            {title && <p className="gc-h2 text-[#748094]">{title}</p>}
            {content && <p>{content}</p>}
          </>
        )}
      </div>
    </div>
  );
};
