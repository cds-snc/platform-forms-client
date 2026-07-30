import { Fragment, memo } from "react";

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

export const StarItem = memo(function StarItem({
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
    <Fragment>
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
    </Fragment>
  );
});
