import React from "react";
export const Input = ({
  handleChange,
}: {
  handleChange: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="grow my-[4px] mx-[8px]">
      <input
        data-testid="tag-input"
        className="w-full border-none p-1 outline-none"
        type="text"
        name="tag-input"
        onKeyUp={handleChange}
      />
    </div>
  );
};
