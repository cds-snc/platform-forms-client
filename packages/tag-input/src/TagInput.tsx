/* eslint-disable tailwindcss/no-custom-classname */

import { useState } from "react";
import { CancelIcon } from "./icons/CancelIcon";
import "./styles.css";

const keys = {
  ENTER: "Enter",
  ESC: "Escape",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  TAB: "Tab",
  DELETE: "Delete",
  BACKSPACE: "Backspace",
  COMMA: ",",
  SPACE: " ",
  SEMICOLON: ";",
};

export const TagInput = ({
  tags,
  name = "tag-input",
  id = "tag-input",
  label = "Tags",
  placeholder,
  description,
  restrictDuplicates = true,
  onTagAdd,
  onTagRemove,
  validateTag,
}: {
  tags?: string[];
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  restrictDuplicates?: boolean;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  validateTag?: (tag: string) => boolean;
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(tags || []);

  const handleAddTag = (tag: string) => {
    if (validateTag && !validateTag(tag)) {
      // @TODO: Handle invalid tag case (exception?)
      return;
    }

    if (restrictDuplicates && selectedTags.includes(tag)) {
      // announce duplicate tag + highlight previous
      return;
    }

    if (onTagAdd) {
      onTagAdd(tag);
    }
    setSelectedTags((prevTags) => [...prevTags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    if (onTagRemove) {
      onTagRemove(tag);
    }

    setSelectedTags((prevTags) => prevTags.filter((t) => t !== tag));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    const acceptKeys = [keys.ENTER, keys.TAB, keys.COMMA, keys.SEMICOLON];

    if (acceptKeys.includes(key)) {
      event.preventDefault();
      const tag = event.currentTarget.value.trim();
      if (tag) {
        handleAddTag(tag);
        event.currentTarget.value = "";
      }
    }

    if (key === keys.DELETE) {
      const lastTag = tags && tags[tags.length - 1];
      if (lastTag) {
        handleRemoveTag(lastTag);
        event.currentTarget.value = "";
      }
    }
  };

  return (
    <>
      <label htmlFor={id} className="gc-tag-input-label">
        {label}
      </label>
      {description && <p className="gc-tag-input-description">{description}</p>}
      <div className="gc-tag-input">
        {selectedTags.map((tag, index) => (
          <div key={`${tag}-${index}`} className="tag">
            <div className="">{tag}</div>
            <button className="" onClick={() => handleRemoveTag(tag)}>
              <CancelIcon />
            </button>
          </div>
        ))}

        <input
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
      </div>
    </>
  );
};
