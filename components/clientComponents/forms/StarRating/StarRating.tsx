"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { useTranslation } from "@i18n/client";

interface StarRatingProps extends InputFieldProps {
  numberOfStars?: number;
  sparkleOnSelect?: boolean;
}

interface StarItemProps {
  starValue: number;
  inputId: string;
  name: string;
  required: boolean | undefined;
  checked: boolean;
  tabIndex: number;
  ariaLabel: string;
  active: boolean;
  focused: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: () => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  sparkle: boolean;
  onSparkleEnd: () => void;
}

const StarItem = React.memo(function StarItem({
  starValue,
  inputId,
  name,
  required,
  checked,
  tabIndex,
  ariaLabel,
  active,
  focused,
  inputRef,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  sparkle,
  onSparkleEnd,
}: StarItemProps) {
  return (
    <React.Fragment>
      <input
        type="radio"
        className="sr-only"
        id={inputId}
        name={name}
        value={String(starValue)}
        required={required}
        checked={checked}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        ref={inputRef}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      <label
        htmlFor={inputId}
        className={`gc-star-rating__label relative cursor-pointer text-4xl leading-none select-none rounded${
          focused ? "outline-blue-focus outline-[3px] outline-offset-2 outline-solid" : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {sparkle &&
          [1, 2, 3, 4, 5, 6].map((n) => (
            <span
              key={n}
              className={`gc-star-particle gc-star-particle--${n}`}
              aria-hidden="true"
              {...(n === 2 ? { onAnimationEnd: onSparkleEnd } : {})}
            >
              ★
            </span>
          ))}
        <span
          className={
            active
              ? "gc-star-rating__star gc-star-rating__star--active text-yellow-400"
              : "gc-star-rating__star text-gray-300"
          }
          aria-hidden="true"
        >
          ★
        </span>
      </label>
    </React.Fragment>
  );
});

export const StarRating = (props: StarRatingProps): React.ReactElement => {
  const { name, required, numberOfStars = 5, sparkleOnSelect = false, id, lang } = props;
  const [field, meta, helpers] = useField(name);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [sparkleStar, setSparkleStar] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { t } = useTranslation("common", { lng: lang });

  const currentValue = field.value ? Number(field.value) : 0;
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
      helpers.setValue(String(newValue));
      setHovered(newValue);
      inputRefs.current[newIndex]?.focus();
    },
    [stars, helpers]
  );

  const errorId = meta.error ? `error-${id}` : undefined;

  return (
    <div className="gc-star-rating">
      {meta.error && <ErrorMessage id={errorId}>{meta.error}</ErrorMessage>}
      <div
        className="gc-star-rating__stars flex gap-1"
        role="radiogroup"
        aria-labelledby={`label-${id}`}
        aria-required={required || undefined}
        aria-invalid={meta.error ? "true" : undefined}
        aria-describedby={errorId}
      >
        {stars.map((starValue, index) => (
          <StarItem
            key={starValue}
            starValue={starValue}
            inputId={`${id}.${starValue - 1}`}
            name={name}
            required={required}
            checked={field.value === String(starValue)}
            tabIndex={getTabIndex(starValue)}
            ariaLabel={t("starRating.starLabel", { count: starValue })}
            active={activeValue >= starValue}
            focused={focused === starValue}
            inputRef={(el) => {
              inputRefs.current[index] = el;
            }}
            sparkle={sparkleStar === starValue}
            onSparkleEnd={() => setSparkleStar(null)}
            onChange={() => {
              helpers.setValue(String(starValue));
              if (sparkleOnSelect) setSparkleStar(starValue);
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
