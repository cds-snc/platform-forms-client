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
      data-testid="tag"
      className="m-1 px-2 border-grey-default border-2 rounded-l-xl rounded-r-xl inline-block"
    >
      <span className="break-all inline-bock">
        {tag}
        <button
          className="[&_svg]:fill-gray-500 [&_svg]:hover:fill-red-500 [&_svg]:focus:fill-red-500 ml-2 p-[1px] align-middle"
          onClick={() => onRemove(tag)}
          aria-label={label}
        >
          <RoundCloseIcon />
        </button>
      </span>
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
