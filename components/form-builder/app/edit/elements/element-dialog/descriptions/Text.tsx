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
    <div className="ml-1">
      <h3 className="mb-0">{label}</h3>
      <p className="mb-2">{description}</p>
      <div
        style={height ? { height } : {}}
        className="w-[350px] rounded border-black-default border-2 p-1"
      >
        {value}
      </div>
    </div>
  );
};
