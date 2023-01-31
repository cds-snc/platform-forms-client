import React from "react";

import { RoundCloseIcon } from "@components/form-builder/icons";
import { useTranslation } from "next-i18next";

type TagProps = {
  tag: string;
  onRemove: (tag: string) => void;
};

export const Tag = ({ tag, onRemove }: TagProps) => {
  const { t } = useTranslation("form-builder");
  const label = `${t("remove")} ${tag}`;
  return (
    <div
      data-testid="tags"
      className="m-1 pl-3 pr-3 border-grey-default border-2 rounded-l-xl rounded-r-xl inline-block relative"
    >
      <span className="break-all inline-bock mr-6">{tag}</span>
      <button
        className="[&_svg]:fill-gray-500 [&_svg]:hover:fill-red-500 [&_svg]:focus:fill-red-500 ml-2 absolute p-[1px] right-[6px] top-[6px]"
        onClick={() => onRemove(tag)}
        aria-label={label}
      >
        <RoundCloseIcon />
      </button>
    </div>
  );
};

type TagsProps = {
  tags: string[];
  onRemove: (tag: string) => void;
};

export const Tags = ({ tags, onRemove }: TagsProps) => {
  if (tags.length < 1) {
    return null;
  }

  return (
    <div>
      {tags.map((tag) => (
        <Tag tag={tag} key={tag} onRemove={onRemove} />
      ))}
    </div>
  );
};
