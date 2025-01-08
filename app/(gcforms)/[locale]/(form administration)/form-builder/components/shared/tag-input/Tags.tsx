"use client";
import React from "react";

import { RoundCloseIcon } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";

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
      className="m-1 inline-block rounded-xl border-2 border-gray-default px-2"
    >
      <span className="inline-block">
        {tag}
        <button
          className="ml-2 p-px align-middle [&_svg]:fill-gray-500 [&_svg]:hover:fill-red-500 [&_svg]:focus:fill-red-500"
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
