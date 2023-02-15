import { useState, useCallback, KeyboardEvent, useRef } from "react";
interface PanelButton {
  id: number;
  txt: string;
  icon: ({ className, title }: { className: string; title: string }) => JSX.Element;
  onClick: () => void | undefined;
  disabled?: boolean;
}

export const usePanelActions = ({
  panelButtons,
  isFirstItem,
  isLastItem,
  elementsLength,
}: {
  panelButtons: PanelButton[];
  isFirstItem: boolean;
  isLastItem: boolean;
  elementsLength: number;
}) => {
  const itemsRef = useRef<[HTMLButtonElement] | []>([]);

  const [currentFocusIndex, setCurrentFocusIndex] = useState(isFirstItem ? 1 : 0);

  const [items] = useState(panelButtons.map(({ id, txt }) => ({ id, txt })));

  const setRef = (name: string) => {
    return (el: HTMLButtonElement) => {
      const index = name as unknown as number;
      if (el && itemsRef.current) {
        itemsRef.current[index] = el;
      }
    };
  };

  const handleNav = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
      const { key } = evt;
      let step = 1;

      if (key === "ArrowLeft") {
        evt.preventDefault();
        if (isFirstItem && currentFocusIndex === 1) {
          return;
        }
        if (isLastItem && currentFocusIndex === 2) {
          step = 2;
        }
        setCurrentFocusIndex((index) => Math.max(0, index - step));
      }

      if (key === "ArrowRight") {
        evt.preventDefault();
        if (isLastItem && currentFocusIndex === 0) {
          step = 2;
        }
        setCurrentFocusIndex((index) => Math.min(items.length - 1, index + step));
      }
    },
    [items, setCurrentFocusIndex, currentFocusIndex, isFirstItem, isLastItem]
  );

  const getTabIndex = (item: string) => {
    if (elementsLength === 1 && item === "duplicate") return 0;

    if (currentFocusIndex === items.findIndex((i) => i.txt === item)) return 0;

    if (currentFocusIndex === 0) {
      if (isFirstItem && item === "moveDown") return 0;
    }

    return -1;
  };

  return {
    setRef,
    itemsRef,
    currentFocusIndex,
    handleNav,
    getTabIndex,
  };
};
