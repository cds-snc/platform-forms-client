import { cn } from "@root/lib/utils";
import React from "react";

export const LabelledInput = ({
  label,
  children,
  classNames,
}: {
  label: string;
  children: React.ReactElement<{ id?: string }>;
  classNames?: string;
}) => {
  const inputId = children.props.id;

  return (
    <div className={cn("mb-4 flex", classNames)}>
      <label
        htmlFor={inputId}
        className="inline-block border-t-2 border-b-2 border-l-2 border-black bg-slate-50 p-4 text-sm"
      >
        {label}
      </label>
      {children}
    </div>
  );
};
