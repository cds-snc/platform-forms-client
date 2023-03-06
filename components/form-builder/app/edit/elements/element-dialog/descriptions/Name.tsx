import React from "react";

export const Name = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <div className="font-bold text-[1.5rem]">{title}</div>
      <p className="mb-2">{description}</p>
    </div>
  );
};
