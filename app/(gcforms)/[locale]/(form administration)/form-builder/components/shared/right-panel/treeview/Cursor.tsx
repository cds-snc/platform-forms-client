import React from "react";
import { CursorProps } from "react-arborist";

export const Cursor = ({ top, left }: CursorProps) => {
  return (
    <div
      className="absolute z-[50000] h-[4px] w-[350px] border-b-2 bg-violet-900 pr-[60px]"
      style={{ top, left }}
    ></div>
  );
};
