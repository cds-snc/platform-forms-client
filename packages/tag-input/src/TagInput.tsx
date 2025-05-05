import { useRef, useState } from "react";
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

const aria = {
  // @TODO: i18n
  tag: (tag: string) => `Tag "${tag}"`,
  duplicateTag: (tag: string) => `Duplicate tag "${tag}"`,
  invalidTag: (tag: string, reasons: string[]) => `Invalid tag "${tag}" (${reasons.join(", ")})`,
  tagAdded: (tag: string) => `Tag "${tag}" added`,
  tagRemoved: (tag: string) => `Tag "${tag}" removed`,
  tagSelected: (tag: string) => `Tag "${tag}" selected. Press delete to remove.`,

  inputLabel: (tags: number) =>
    `${tags} tags. Use left and right arrow keys to navigate, enter, tab or comma to create, backspace or delete to delete tags.`,
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
  validateTag?: (tag: string) => {
    isValid: boolean;
    errors?: string[];
  };
}) => {
  const tagInputContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags || []);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [ariaLiveRegionText, setAriaLiveRegionText] = useState<string | null>(null);

  const say = (phrase: string) => {
    setAriaLiveRegionText(phrase);
  };

  const resetMessages = () => {
    setErrorMessages([]);
  };

  const handleAddTag = (tag: string) => {
    resetMessages();

    if (validateTag) {
      const { isValid, errors } = validateTag(tag);
      if (!isValid) {
        setErrorMessages(errors || []);
        // Announce invalid tag
        if (tagInputContainerRef.current) {
          say(aria.invalidTag(tag, errors || []));
        }

        return;
      }
    }

    if (restrictDuplicates && selectedTags.includes(tag)) {
      // Announce duplicate tag
      if (tagInputContainerRef.current) {
        say(aria.duplicateTag(tag));
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

    // Fire onTagAdd callback
    if (onTagAdd) {
      onTagAdd(tag);
    }

    // Announce tag added
    if (tagInputContainerRef.current) {
      say(aria.tagAdded(tag));
    }

    // Add the tag to the selected tags
    setSelectedTags((prevTags) => [...prevTags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    // Fire onTagRemove callback
    if (onTagRemove) {
      onTagRemove(tag);
    }

    // Announce tag removed
    if (tagInputContainerRef.current) {
      say(aria.tagRemoved(tag));
    }

    // Remove the tag from the selected tags
    setSelectedTags((prevTags) => prevTags.filter((t) => t !== tag));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    const acceptKeys = [keys.ENTER, keys.TAB, keys.COMMA];

    if (acceptKeys.includes(key)) {
      event.preventDefault();
      const tag = event.currentTarget.value.trim();
      if (tag) {
        handleAddTag(tag);
        event.currentTarget.value = "";
      }
    }

    if (key === keys.DELETE) {
      // If a tag is selected, delete it
      if (selectedTagIndex !== null) {
        const tagToRemove = selectedTags[selectedTagIndex];
        handleRemoveTag(tagToRemove);
        setSelectedTagIndex(null);
        return;
      }
    }

    if (key === keys.BACKSPACE) {
      // If a tag is selected, delete it
      if (selectedTagIndex !== null) {
        const tagToRemove = selectedTags[selectedTagIndex];
        handleRemoveTag(tagToRemove);
        setSelectedTagIndex(null);
        return;
      }

      // If the input is empty, delete the last tag
      if (event.currentTarget.value === "") {
        // Otherwise, delete the last tag
        const lastTag = selectedTags[selectedTags.length - 1];
        if (lastTag) {
          handleRemoveTag(lastTag);
          event.currentTarget.value = "";
        }
      }
    }

    if (event.currentTarget.value === "") {
      if (key === keys.ARROW_LEFT) {
        if (selectedTags.length) {
          if (selectedTagIndex === null) {
            setSelectedTagIndex(selectedTags.length - 1);
          } else if (selectedTagIndex > 0) {
            setSelectedTagIndex(selectedTagIndex - 1);
          }
        }
      }

      if (key === keys.ARROW_RIGHT) {
        if (selectedTags.length) {
          if (selectedTagIndex === null) {
            setSelectedTagIndex(0);
          } else if (selectedTagIndex < selectedTags.length - 1) {
            setSelectedTagIndex(selectedTagIndex + 1);
          }
        }
      }
    }
  };

  return (
    <div className="gc-tag-input-container" ref={tagInputContainerRef}>
      <label htmlFor={id} className="gc-tag-input-label">
        {label}
      </label>
      {description && <p className="gc-tag-input-description">{description}</p>}
      <span id="input-instructions" aria-live="polite" className="visually-hidden">
        {aria.inputLabel(selectedTags.length)}
      </span>
      <div className="gc-tag-input">
        {selectedTags.map((tag, index) => (
          <div
            key={`${tag}-${index}`}
            id={`tag-${index}`}
            className={`gc-tag ${selectedTagIndex === index ? "gc-selected-tag" : ""}`}
            aria-label={aria.tag(tag)}
          >
            <div className="">{tag}</div>
            <button type="button" className="" onClick={() => handleRemoveTag(tag)}>
              <CancelIcon />
            </button>
          </div>
        ))}

        <input
          aria-describedby="input-instructions"
          data-testid="tag-input"
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
        <span className="visually-hidden" role="alert" aria-live="assertive" aria-atomic="true">
          {ariaLiveRegionText}
        </span>
      </div>
      {errorMessages.length > 0 && (
        <div role="alert" className="gc-tag-input-error" data-testid="tag-input-error">
          {errorMessages.map((error, index) => (
            <div key={`error-${index}`}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};
