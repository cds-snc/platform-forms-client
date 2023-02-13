import React, { useRef, useState, useCallback, useEffect, KeyboardEvent } from "react";

// for specs see:
// https://www.w3.org/WAI/ARIA/apg/patterns/listbox

export const ListBox = ({
  options,
  handleChange,
  ariaLabel,
}: {
  options: { id: string; value: string; group: { id: string; value: string } }[];
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
            }: {
              id: string;
              value: string;
              group: { id: string; value: string };
            },
            index: number
          ) => {
            const focussed = focusIndex === index;
            let groupOption = null;

            if (group && listGroup != group.value) {
              groupOption = (
                <li
                  role="presentation"
                  className="pl-1 mb-2 text-gray-600 font-bold uppercase text-[1.1rem]"
                >
                  {group.value}
                </li>
              );
              listGroup = group.value;
            }

            return (
              /* eslint-disable jsx-a11y/click-events-have-key-events */
              <>
                {groupOption}
                <li
                  id={`row-${id}`}
                  ref={(el) => {
                    if (el && rowsRef.current) {
                      rowsRef.current[`row-${index}` as unknown as number] = el;
                    }
                  }}
                  className={`${
                    focussed ? "font-bold" : "font-normal"
                  } group xl:pb-0 xl:pt-2 xl:mb-3 pl-1 pr-2 pb-2 mb-2 md:pr-0 text-black hover:text-blue-hover focus:text-blue-hover cursor-pointer`}
                  key={id}
                  tabIndex={-1}
                  role="option"
                  onClick={() => setFocusIndex(index)}
                  aria-selected={focussed}
                >
                  {value}
                </li>
              </>
            );
          }
        )}
      </ul>
    </div>
  );
};
