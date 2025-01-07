"use client";
import React from "react";
export const Input = ({
  onKeyUp,
  onBlur,
}: {
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: { target: HTMLInputElement }) => void;
}) => {
  return (
    <div className="mx-[8px] my-[4px] grow">
      <input
        data-testid="tag-input"
        className="w-full border-none p-1 outline-none"
        type="text"
        name="tag-input"
        onKeyUp={onKeyUp && onKeyUp}
        onBlur={onBlur && onBlur}
      />
    </div>
  );
};
