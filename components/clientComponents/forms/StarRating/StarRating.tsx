"use client";
import React, { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { StarItem } from "./StarItem";
import { StarRatingObject } from "./types";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";

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

  // Defer to client-side value after mount to avoid hydration mismatch.
  // The save-progress feature restores values from localStorage on the client
  // but the server renders without them causing a mismatch if used immediately.
  // useSyncExternalStore returns the server snapshot (false) on SSR and the
  // client snapshot (true) after hydration — a React two-pass pattern.
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const parseStoredValue = (raw: string): number => {
    if (!raw) return 0;
    try {
      const parsed = JSON.parse(raw) as StarRatingObject;
      return parsed?.value ?? 0;
    } catch {
      return 0;
    }
  };

  const currentValue = isClient ? parseStoredValue(field.value) : 0;
  const activeValue = hovered !== null ? hovered : currentValue;

  // numberOfStars is a static prop — only recompute if it changes
  const stars = useMemo(
    () => Array.from({ length: numberOfStars }, (_, i) => i + 1),
    [numberOfStars]
  );

  const getTabIndex = (starValue: number): number => {
    if (currentValue > 0) return currentValue === starValue ? 0 : -1;
    return starValue === 1 ? 0 : -1;
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, starValue: number) => {
      const currentIndex = starValue - 1;
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
      helpers.setValue(JSON.stringify({ value: newValue, numberOfStars }));
      setHovered(newValue);
      inputRefs.current[newIndex]?.focus();
    },
    [stars, helpers, numberOfStars]
  );

  const errorMessageId = getErrorMessageId(id);
  const describedByIds = getDescribedByIds(meta.error ? errorMessageId : undefined);

  return (
    <div>
      {meta.error && <ErrorMessage id={errorMessageId}>{meta.error}</ErrorMessage>}
      <div
        className="flex gap-1"
        role="radiogroup"
        aria-labelledby={`label-${id}`}
        aria-required={required ? "true" : undefined}
        aria-invalid={meta.error ? "true" : undefined}
        aria-describedby={describedByIds}
      >
        {stars.map((starValue, index) => (
          <StarItem
            key={starValue}
            starValue={starValue}
            id={`${id}.${starValue - 1}`}
            name={name}
            checked={isClient && currentValue === starValue}
            tabIndex={getTabIndex(starValue)}
            ariaLabel={t("starRating.starLabel", { count: starValue })}
            active={activeValue >= starValue}
            focused={focused === starValue}
            inputRef={(el) => {
              inputRefs.current[index] = el;
            }}
            onChange={() => {
              helpers.setValue(JSON.stringify({ value: starValue, numberOfStars }));
            }}
            onFocus={(e) => {
              setHovered(starValue);
              if (e.currentTarget.matches(":focus-visible")) setFocused(starValue);
            }}
            onBlur={() => {
              setHovered(null);
              setFocused(null);
            }}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>
    </div>
  );
};
