import React from "react";

import { Tags } from "./Tags";
import { Input } from "./Input";

export const TagInput = ({
  tags,
  setTags,
  validateTag,
}: {
  tags: string[];
  setTags: (tag: string[]) => void;
  validateTag?: (tag: string) => boolean;
}) => {
  const onRemove = (text: string) => {
    setTags(tags.filter((tag) => tag !== text));
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const text = (e.target as HTMLInputElement).value.trim().replace(",", "");

    if (!text && tags.length && e.key === "Backspace") {
      (e.target as HTMLInputElement).value = `${tags.at(-1)}`;
      setTags([...new Set(tags.slice(0, -1))]);
    }

    if (text && ["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      if (validateTag && !validateTag(text)) return;

      setTags([...new Set([...tags, text])]);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const onBlur = (e: { target: HTMLInputElement }) => {
    const text = (e.target as HTMLInputElement).value.trim().replace(",", "");

    if (validateTag && !validateTag(text)) return;

    if (text) {
      setTags([...new Set([...tags, text])]);
      (e.target as HTMLInputElement).value = "";
    }
  };

  return (
    <div className="flex flex-wrap rounded-md box-border border-black-default border-2 w-[533px]">
      <Tags tags={tags} onRemove={onRemove} />
      <Input onKeyUp={onKeyUp} onBlur={onBlur} />
    </div>
  );
};
