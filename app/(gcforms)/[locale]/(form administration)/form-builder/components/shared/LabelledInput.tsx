import React from "react";

export const LabelledInput = ({
  label,
  children,
  id,
}: {
  label: string;
  children: React.ReactElement;
  id: string;
}) => {
  return (
    <div className="mb-4 flex rounded-md border-1 border-black">
      <label
        htmlFor={id}
        className="block rounded-l-md border-r-1 border-black bg-slate-50 p-4 text-sm"
      >
        {label}
      </label>
      {React.cloneElement(children, {
        // @ts-expect-error -- Fix this
        className: "block w-full rounded-r-md p-2 outline-offset-[-5px]",
        id,
      })}
    </div>
  );
};
