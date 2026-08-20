import { Fragment, memo } from "react";
import { StarRatingIcon } from "@root/components/serverComponents/icons";

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
        className={`relative cursor-pointer text-4xl leading-none select-none rounded${
          focused ? "outline-blue-focus outline-[3px] outline-offset-2 outline-solid" : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <StarRatingIcon className="size-12" active={active} title={ariaLabel} />
      </label>
    </Fragment>
  );
});
