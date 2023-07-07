import React from "react";

interface CardProps {
  children?: React.ReactNode;
  icon?: JSX.Element;
  title?: string;
}

export const InfoCard = (props: CardProps) => {
  const { children, icon, title } = props;

  return (
    <div className="border-1 rounded-lg mx-5 pb-5">
      {icon && <div>{icon}</div>}
      <div className="flex flex-col justify-center">
        {title && <p className="gc-h3 text-[#000] bg-violet-100 px-8 py-3 rounded-t-lg">{title}</p>}
        <span className="mx-8">{children && children}</span>
      </div>
    </div>
  );
};
