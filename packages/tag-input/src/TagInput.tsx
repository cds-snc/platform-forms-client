import { useRef, useState } from "react";
import { CancelIcon } from "./icons/CancelIcon";
import "./styles.css";
import { useTranslation } from "./i18n/useTranslation";
import { WarningIcon } from "./icons/WarningIcon";

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
  initialTags,
  name = "tag-input",
  id = "tag-input",
  label = "Tags",
  locale = "en",
  placeholder,
  description,
  restrictDuplicates = true,
  maxTags,
  onTagAdd,
  onTagRemove,
  validateTag,
}: {
  initialTags?: string[];
  name?: string;
  id?: string;
  label?: string;
  locale?: string;
  placeholder?: string;
  description?: string;
  restrictDuplicates?: boolean;
  maxTags?: number;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  validateTag?: (tag: string) => {
    isValid: boolean;
    errors?: string[];
  };
}) => {
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || []);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [ariaLiveRegionText, setAriaLiveRegionText] = useState<string | null>(null);
  const { t } = useTranslation(locale);

  const say = (phrase: string) => {
    setAriaLiveRegionText(phrase);
  };

  const resetMessages = () => {
    setErrorMessages([]);
  };

  const handleAddTag = (tag: string) => {
    resetMessages();

    if (maxTags && selectedTags.length >= maxTags) {
      // Announce max tags reached
      say(t("maxTagsReached", { maxTags: maxTags.toString() }));

      // Display a validation error
      setErrorMessages([t("maxTagsReached", { max: maxTags.toString() })]);
      return;
    }

    if (validateTag) {
      const { isValid, errors } = validateTag(tag);
      if (!isValid) {
        // Announce invalid tag
        say(t("announceInvalidTag", { tag }));

        // Display validation errors
        setErrorMessages(errors || []);
        return;
      }
    }

    if (restrictDuplicates && selectedTags.includes(tag)) {
      // Announce duplicate tag
      say(t("announceDuplicateTag", { tag }));

      // Highlight the duplicate tag momentarily
      const duplicateTagIndex = selectedTags.indexOf(tag);
      const duplicateTagElement = document.getElementById(`tag-${duplicateTagIndex}`);
      if (duplicateTagElement) {
        duplicateTagElement.classList.add("duplicate");
        setTimeout(() => {
          duplicateTagElement.classList.remove("duplicate");
        }, 4000); // Remove the class after 4 seconds
      }

      // Display a validation error
      setErrorMessages([t("duplicateTag", { tag })]);
      return;
    }

    // Fire onTagAdd callback
    if (onTagAdd) {
      onTagAdd(tag);
    }

    // Announce tag added
    say(t("announceTagAdded", { tag }));

    // Add the tag to the selected tags
    setSelectedTags((prevTags) => [...prevTags, tag]);
  };

  const handleRemoveTag = (index: number) => {
    const tag = selectedTags[index];

    // Fire onTagRemove callback
    if (onTagRemove) {
      onTagRemove(tag);
    }

    // Announce tag removed
    say(t("announceTagRemoved", { tag }));

    // Remove the tag from the selected tags
    setSelectedTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    resetMessages();

    const { key } = event;
    const acceptKeys = [keys.ENTER, keys.TAB, keys.COMMA];
    const navigateKeys = [keys.ARROW_LEFT, keys.ARROW_RIGHT];

    // Clear selection when entering text input
    if (!navigateKeys.includes(key) && selectedTagIndex !== null) {
      setSelectedTagIndex(null);
    }

    // Accept tag input
    if (acceptKeys.includes(key)) {
      const tag = event.currentTarget.value.trim();
      if (tag) {
        event.preventDefault();
        handleAddTag(tag);
        event.currentTarget.value = "";
      }
    }

    // Delete selected tag
    if (key === keys.DELETE && selectedTagIndex !== null) {
      handleRemoveTag(selectedTagIndex);
      setSelectedTagIndex(null);
      return;
    }

    // Backspace key handling
    if (key === keys.BACKSPACE) {
      // If a tag is selected, delete it
      if (selectedTagIndex !== null) {
        handleRemoveTag(selectedTagIndex);
        setSelectedTagIndex(null);
        return;
      }

      // If the input is empty, delete the last tag
      if (event.currentTarget.value === "") {
        if (selectedTags.length) {
          handleRemoveTag(selectedTags.length - 1);
          event.currentTarget.value = "";
        }
      }
    }

    // Roving through tags with arrow keys
    if (event.currentTarget.value === "") {
      if (key === keys.ARROW_LEFT) {
        if (selectedTags.length) {
          let newTagIndex = 0;
          if (selectedTagIndex === null) {
            newTagIndex = selectedTags.length - 1;
          } else if (selectedTagIndex > 0) {
            newTagIndex = selectedTagIndex - 1;
          }
          setSelectedTagIndex(newTagIndex);
          say(t("announceTagSelected", { tag: selectedTags[newTagIndex] }));
        }
      }

      if (key === keys.ARROW_RIGHT) {
        if (selectedTags.length) {
          if (selectedTagIndex === null) {
            setSelectedTagIndex(0);
          } else if (selectedTagIndex < selectedTags.length - 1) {
            setSelectedTagIndex(selectedTagIndex + 1);
            say(t("announceTagSelected", { tag: selectedTags[selectedTagIndex + 1] }));
          }
        }
      }
    }
  };

  return (
    <div className="gc-tag-input-container" onClick={() => tagInputRef.current?.focus()}>
      <label htmlFor={id} className="gc-tag-input-label">
        {label}
      </label>
      {description && <p className="gc-tag-input-description">{description}</p>}
      <span id="input-instructions" aria-live="polite" className="visually-hidden">
        {t("inputLabel", { tags: selectedTags.length.toString() })}
      </span>
      <div className="gc-tag-input">
        {selectedTags.map((tag, index) => (
          <div
            key={`${tag}-${index}`}
            id={`tag-${index}`}
            className={`gc-tag ${selectedTagIndex === index ? "gc-selected-tag" : ""}`}
          >
            <div>{tag}</div>
            <button type="button" onClick={() => handleRemoveTag(index)}>
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
          ref={tagInputRef}
        />
        <span
          id="tag-input-live-region"
          className="gc-visually-hidden"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {ariaLiveRegionText}
        </span>
      </div>
      <div
        role="alert"
        aria-live="assertive"
        className="gc-tag-input-error"
        data-testid="tag-input-error"
      >
        {errorMessages.length > 0 &&
          errorMessages.map((error, index) => (
            <div key={`error-${index}`}>
              <WarningIcon />
              {error}
            </div>
          ))}
      </div>
    </div>
  );
};
