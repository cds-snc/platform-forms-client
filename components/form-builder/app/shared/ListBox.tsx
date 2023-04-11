import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  KeyboardEvent,
  ComponentType,
  JSXElementConstructor,
} from "react";

import { ChevronRight } from "@components/form-builder/icons";

// for specs see:
// https://www.w3.org/WAI/ARIA/apg/patterns/listbox

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconType = JSXElementConstructor<any> | ComponentType | JSX.Element | any;

export const ListBox = ({
  options,
  handleChange,
  ariaLabel,
}: {
  options: {
    id: string;
    value: string;
    group: { id: string; value: string };
    className?: string;
    icon?: IconType;
  }[];
  handleChange: (val: number) => void;
  ariaLabel?: string;
}) => {
  const listBoxRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<[HTMLElement] | []>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [activeId, setActiveId] = useState("");
  const handleFocus = useCallback(
    (evt: KeyboardEvent<HTMLElement>) => {
      const { key } = evt;
      if (key === "ArrowUp") {
        evt.preventDefault();
        setFocusIndex((index) => Math.max(0, index - 1));
      } else if (key === "ArrowDown") {
        evt.preventDefault();
        setFocusIndex((index) => Math.min(options.length - 1, index + 1));
      }
    },
    [options]
  );

  useEffect(() => {
    const el = rowsRef.current[`row-${focusIndex}` as unknown as number] as HTMLElement;
    if (el && rowsRef.current) {
      setActiveId(el.id);
      handleChange(focusIndex);
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ block: "center" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusIndex]);

  let listGroup = "";

  return (
    <div
      aria-label={ariaLabel ? ariaLabel : ""}
      data-testid="listbox"
      ref={listBoxRef}
      role="listbox"
      className="list-box"
      tabIndex={0}
      onKeyDown={handleFocus}
      aria-activedescendant={activeId ? activeId : options[0]?.id}
    >
      <ul role="group" className="list-none pl-0">
        {options.map(
          (
            {
              id,
              value,
              group,
              className,
              icon: Icon,
            }: {
              id: string;
              value: string;
              group: { id: string; value: string };
              className?: string;
              icon?: IconType;
            },
            index: number
          ) => {
            const focussed = focusIndex === index;
            let groupOption = null;

            if (group && listGroup != group.value) {
              groupOption = (
                <li
                  role="presentation"
                  className="pl-1 mb-2 text-[#6A6D7B] font-bold uppercase text-[1.1rem]"
                >
                  {group.value}
                </li>
              );
              listGroup = group.value;
            }

            if (!id) return null;

            return (
              /* eslint-disable jsx-a11y/click-events-have-key-events */
              <React.Fragment key={id}>
                {groupOption}
                <li
                  data-testid={id}
                  id={`row-${id}`}
                  ref={(el) => {
                    if (el && rowsRef.current) {
                      rowsRef.current[`row-${index}` as unknown as number] = el;
                    }
                  }}
                  className={`${
                    focussed ? "font-bold bg-[#E9ECEF]" : "font-normal"
                  } group pl-1 pr-2 pt-2 pb-2 mb-2 text-black hover:font-bold cursor-pointer`}
                  tabIndex={-1}
                  role="option"
                  onClick={() => setFocusIndex(index)}
                  aria-selected={focussed}
                >
                  <span className="flex justify-between items-center">
                    <span>
                      {Icon && <Icon className="inline-block mr-2" />} {value}
                    </span>
                    {focussed && (
                      <ChevronRight className="fill-black inline-block mr-1 scale-150" />
                    )}
                  </span>
                </li>
                {className && className === "separator" ? (
                  <li role="separator" className="border-b border-1 border-grey-default mb-2" />
                ) : null}
              </React.Fragment>
            );
          }
        )}
      </ul>
    </div>
  );
};
