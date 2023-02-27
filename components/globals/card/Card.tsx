import React from "react";

// TODO: This card is intended as a generic info card. Other card components exist e.g. myforms/Card
// Future work could be to iterate this Card and replace other Card implementations with this.

interface CardProps {
  children?: React.ReactNode;
  icon?: any;
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
