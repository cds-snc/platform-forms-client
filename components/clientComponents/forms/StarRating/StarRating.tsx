"use client";
import React, { useRef, useState } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { useTranslation } from "@i18n/client";

interface StarRatingProps extends InputFieldProps {
  numberOfStars?: number;
}

export const StarRating = (props: StarRatingProps): React.ReactElement => {
  const { name, required, numberOfStars = 5, id, lang } = props;
  const [field, meta, helpers] = useField(name);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { t } = useTranslation("common", { lng: lang });

  const currentValue = field.value ? Number(field.value) : 0;
  const activeValue = hovered !== null ? hovered : currentValue;

  const stars = Array.from({ length: numberOfStars }, (_, i) => i + 1);

  // Roving tabindex: only the checked star (or the first if none selected) is
  // in the page Tab sequence. All others use tabIndex={-1} so the group acts
  // as a single Tab stop. This matches the W3C APG example.
  const getTabIndex = (starValue: number): number => {
    if (currentValue > 0) {
      return currentValue === starValue ? 0 : -1;
    }
    return starValue === 1 ? 0 : -1;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, starValue: number) => {
    const currentIndex = stars.indexOf(starValue);
    let newIndex: number;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        newIndex = (currentIndex + 1) % stars.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        newIndex = (currentIndex - 1 + stars.length) % stars.length;
        break;
      default:
        return;
    }

    const newValue = stars[newIndex];
    helpers.setValue(String(newValue));
    setHovered(newValue);
    inputRefs.current[newIndex]?.focus();
  };

  return (
    <div className="gc-star-rating">
      {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
      <div
        className="gc-star-rating__stars flex gap-1"
        role="radiogroup"
        aria-labelledby={`label-${id}`}
      >
        {stars.map((starValue, index) => (
          <React.Fragment key={starValue}>
            <input
              type="radio"
              className="sr-only"
              id={`${id}.${starValue - 1}`}
              name={name}
              value={String(starValue)}
              required={required}
              checked={field.value === String(starValue)}
              tabIndex={getTabIndex(starValue)}
              aria-label={t("starRating.starLabel", { count: starValue })}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              onChange={() => helpers.setValue(String(starValue))}
              onFocus={(e) => {
                setHovered(starValue);
                if (e.currentTarget.matches(":focus-visible")) setFocused(starValue);
              }}
              onBlur={() => {
                setHovered(null);
                setFocused(null);
              }}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
            />
            <label
              htmlFor={`${id}.${starValue - 1}`}
              className={`gc-star-rating__label cursor-pointer text-4xl leading-none select-none rounded${focused === starValue ? "outline-blue-focus outline-[3px] outline-offset-2" : ""}`}
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className={
                  activeValue >= starValue
                    ? "gc-star-rating__star gc-star-rating__star--active text-yellow-400"
                    : "gc-star-rating__star text-gray-300"
                }
                aria-hidden="true"
              >
                ★
              </span>
            </label>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
