import React from "react";

export const LabelledInput = ({
  label,
  children,
  id,
  classNames,
}: {
  label: string;
  children: React.ReactElement;
  id: string;
  classNames?: string;
}) => {
  return (
    <div className={`mb-4 flex ${classNames ?? ""}`}>
      <label
        htmlFor={id}
        className="inline-block rounded-l-md border-t-2 border-b-2 border-l-2 border-black bg-slate-50 p-4 text-sm"
      >
        {label}
      </label>
      {children}
    </div>
  );
};
