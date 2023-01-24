import React, { useRef, useState, useCallback, useEffect, KeyboardEvent } from "react";

// for specs see:
// https://www.w3.org/WAI/ARIA/apg/patterns/listbox

export const ListBox = ({
  options,
  handleChange,
}: {
  options: { id: string; value: string }[];
  handleChange: (val: number) => void;
}) => {
  const listBoxRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<[HTMLElement] | []>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [activeId, setActiveId] = useState("");
  const handleFocus = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <div
      data-testid="listbox"
      ref={listBoxRef}
      role="listbox"
      className="w-42"
      tabIndex={0}
      onKeyDown={handleFocus}
      aria-activedescendant={activeId ? activeId : options[0]?.id}
    >
      {options.map(({ id, value }: { id: string; value: string }, index: number) => {
        const focussed = focusIndex === index;
        return (
          /* eslint-disable jsx-a11y/click-events-have-key-events */
          <div
            id={`row-${id}`}
            ref={(el) => {
              if (el && rowsRef.current) {
                rowsRef.current[`row-${index}` as unknown as number] = el;
              }
            }}
            className={`${
              focussed ? "font-bold" : "font-normal"
            } group xl:text-center no-underline xl:w-36 xl:pb-0 xl:pt-2 xl:mb-2 -ml-1 pl-1 pr-2 md:pr-0 text-black-default hover:text-blue-hover visited:text-black-default focus:text-blue-hover focus:active:no-underline`}
            key={id}
            tabIndex={-1}
            role="option"
            onClick={() => setFocusIndex(index)}
            aria-selected={focussed}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
};
