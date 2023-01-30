import React from "react";

import { Tags } from "./Tags";
import { Input } from "./Input";

export const TagInput = ({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (tag: string[]) => void;
}) => {
  const onRemove = (text: string) => {
    setTags(tags.filter((tag) => tag !== text));
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const text = (e.target as HTMLInputElement).value;

    if (!text && tags.length && e.key === "Backspace") {
      (e.target as HTMLInputElement).value = `${tags.at(-1)}`;
      setTags([...new Set(tags.slice(0, -1))]);
    }

    if (text && ["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      setTags([...new Set([...tags, text.trim().replace(",", "")])]);
      (e.target as HTMLInputElement).value = "";
    }
  };

  return (
    <div className="flex flex-wrap rounded-md box-border border-black-default border-2 w-[533px]">
      <Tags tags={tags} onRemove={onRemove} />
      <Input handleChange={onKeyUp} />
    </div>
  );
};
