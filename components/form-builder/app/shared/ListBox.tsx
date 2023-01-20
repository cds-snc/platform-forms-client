import React, { useRef, useState, useCallback, useEffect, KeyboardEvent } from "react";

export const ListBox = ({ options }: { options: any }) => {
  const containerRef = useRef(null);
  const rowsRef = useRef<[HTMLElement] | []>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [activeId, setActiveId] = useState();
  const handleListBoxNav = useCallback(
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
    const index = `row-${focusIndex}` as unknown as number;
    const el = rowsRef.current[index] as any;
    if (el && rowsRef.current) {
      el.focus();
      setActiveId(el.id);
    }
  }, [focusIndex]);

  const isListBoxActiveRow = (index: number) => focusIndex === index;

  return (
    <div
      ref={containerRef}
      role="listbox"
      tabIndex={0}
      onKeyDown={handleListBoxNav}
      aria-activedescendant={activeId ? activeId : options[0]?.id}
    >
      {options.map((option: any, index: number) => {
        const id = option.id;
        const rowIndex = `row-${index}` as unknown as number;
        return (
          <div
            id={`row-${id}`}
            ref={(el) => {
              if (el && rowsRef.current) {
                rowsRef.current[rowIndex] = el;
              }
            }}
            key={id}
            tabIndex={-1}
            role="option"
            onClick={() => setFocusIndex(index)}
            aria-selected={isListBoxActiveRow(index)}
          >
            {option.value}
          </div>
        );
      })}
    </div>
  );
};
