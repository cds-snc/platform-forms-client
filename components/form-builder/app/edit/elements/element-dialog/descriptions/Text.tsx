import React from "react";

export const Text = ({
  label,
  description,
  value,
  height,
}: {
  label: string;
  description: string;
  value: string;
  height?: number;
}) => {
  return (
    <div>
      <div className="font-bold text-[1.5rem]">{label}</div>
      <div className="mb-2">{description}</div>
      <div
        style={height ? { height } : {}}
        className="w-[350px] rounded border-black-default border-2 p-1"
      >
        {value}
      </div>
    </div>
  );
};
