"use client";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  KeyboardEvent,
  ComponentType,
  JSXElementConstructor,
} from "react";

import { ChevronRight } from "@clientComponents/icons";

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
                  className="mb-2 pl-4 text-[1.1rem] font-bold uppercase text-[#6A6D7B]"
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
                    focussed
                      ? "border-[0.5px] border-indigo-700 bg-indigo-50 font-bold"
                      : "font-normal"
                  } group mb-2 cursor-pointer py-2 pl-4 pr-2 text-lg text-black hover:font-bold hover:text-indigo-700`}
                  tabIndex={-1}
                  role="option"
                  onClick={() => setFocusIndex(index)}
                  aria-selected={focussed}
                >
                  <span className="flex items-center justify-between">
                    <span>
                      {Icon && <Icon className="mr-2 inline-block" />} {value}
                    </span>
                    {focussed && (
                      <ChevronRight className="mr-1 inline-block scale-150 fill-black" />
                    )}
                  </span>
                </li>
                {className && className === "separator" ? (
                  <li role="separator" className="mb-2 border-1 border-b border-gray" />
                ) : null}
              </React.Fragment>
            );
          }
        )}
      </ul>
    </div>
  );
};
