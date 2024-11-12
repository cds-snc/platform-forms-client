import React from "react";

interface CardProps {
  children?: React.ReactNode;
  icon?: JSX.Element;
  title?: string;
}

export const InfoCard = (props: CardProps) => {
  const { children, icon, title } = props;

  return (
    <article className="mx-5 rounded-lg border-1 pb-5">
      {icon && <div>{icon}</div>}
      <div className="flex flex-col justify-center">
        {title && (
          <h2 className="gc-h3 rounded-t-lg bg-violet-100 px-8 py-3 text-[#000]">{title}</h2>
        )}
        <div className="mx-8">{children && children}</div>
      </div>
    </article>
  );
};
