import { Fragment, memo } from "react";
import { StarRatingIcon } from "@root/components/serverComponents/icons";

// Note: required is handled by the parent role="radiogroup" with an aria-required
interface StarItemProps {
  starValue: number;
  id: string;
  name: string;
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
  id,
  name,
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
        id={id}
        name={name}
        value={String(starValue)}
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
        htmlFor={id}
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
