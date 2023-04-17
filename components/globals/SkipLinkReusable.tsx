import React from "react";

export const SkipLinkReusable = ({
  text,
  anchor,
  className,
  offset = "focus:mt-[-3rem]",
}: {
  text: string;
  anchor: string;
  className?: string;
  offset?: string;
}) => {
  const classes =
    (className
      ? className
      : `
    absolute w-[1px] h-[1px] truncate whitespace-nowrap
    focus:block focus:p-2 focus:w-auto focus:h-auto focus:overflow-auto
  `) + offset;

  return (
    <div className="relative">
      <div className="absolute z-10">
        <a href={anchor} className={classes}>
          {text}
        </a>
      </div>
    </div>
  );
};
