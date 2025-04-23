import { useRef, useState } from "react";
import { CancelIcon } from "./icons/CancelIcon";
import "./styles.css";
import { say } from "./utils/say";

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

const announcements = {
  tag: (tag: string) => `Tag "${tag}"`,
  duplicateTag: (tag: string) => `Duplicate tag "${tag}"`,
  invalidTag: (tag: string) => `Invalid tag "${tag}"`,
  tagAdded: (tag: string) => `Tag "${tag}" added`,
  tagRemoved: (tag: string) => `Tag "${tag}" removed`,
  inputLabel: (tags: string[]) =>
    `${tags} tags. Use left and right arrow keys to navigate, enter or tab to create, delete to delete tags.`,
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
  const tagInputContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags || []);

  const handleAddTag = (tag: string) => {
    if (validateTag && !validateTag(tag)) {
      // @TODO: Handle invalid tag case (exception?)
      // Announce invalid tag
      return;
    }

    if (restrictDuplicates && selectedTags.includes(tag)) {
      // Announce duplicate tag
      if (tagInputContainerRef.current) {
        say(announcements.duplicateTag(tag), tagInputContainerRef.current);
      }

      // Highlight the duplicate tag momentarily
      const duplicateTagIndex = selectedTags.indexOf(tag);
      const duplicateTagElement = document.getElementById(`tag-${duplicateTagIndex}`);
      if (duplicateTagElement) {
        duplicateTagElement.classList.add("duplicate");
        setTimeout(() => {
          duplicateTagElement.classList.remove("duplicate");
        }, 4000); // Remove the class after 4 seconds
      }
      return;
    }

    if (onTagAdd) {
      onTagAdd(tag);
    }
    if (tagInputContainerRef.current) {
      say(announcements.tagAdded(tag), tagInputContainerRef.current);
    }
    setSelectedTags((prevTags) => [...prevTags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    if (onTagRemove) {
      onTagRemove(tag);
    }

    if (tagInputContainerRef.current) {
      say(announcements.tagRemoved(tag), tagInputContainerRef.current);
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
      const lastTag = selectedTags[selectedTags.length - 1];
      if (lastTag) {
        handleRemoveTag(lastTag);
        event.currentTarget.value = "";
      }
    }
  };

  return (
    <div className="gc-tag-input-container" ref={tagInputContainerRef}>
      <label htmlFor={id} className="gc-tag-input-label">
        {label}
      </label>
      {description && <p className="gc-tag-input-description">{description}</p>}
      <div className="gc-tag-input">
        {selectedTags.map((tag, index) => (
          <div key={`${tag}-${index}`} id={`tag-${index}`} className="gc-tag">
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
    </div>
  );
};
