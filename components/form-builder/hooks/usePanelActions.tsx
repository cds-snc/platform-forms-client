import { useState, useCallback, KeyboardEvent, useRef } from "react";
interface PanelButton {
  id: number;
  txt: string;
  icon: ({ className, title }: { className: string; title: string }) => JSX.Element;
  onClick: () => void;
  disabled?: boolean;
}

export const usePanelActions = ({
  panelButtons,
  isFirstItem,
  isLastItem,
  totalItems,
  orientation,
}: {
  panelButtons: PanelButton[];
  isFirstItem: boolean;
  isLastItem: boolean;
  totalItems: number;
  orientation: "horizontal" | "vertical";
}) => {
  const itemsRef = useRef<[HTMLButtonElement] | []>([]);

  const startingFocusIndex = isFirstItem && isLastItem ? 2 : isFirstItem ? 1 : 0;

  const [currentFocusIndex, setCurrentFocusIndex] = useState(startingFocusIndex);
  const isRoving = useRef(false);

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

      const back = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
      const forward = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";

      if (key === back) {
        evt.preventDefault();
        if (isFirstItem && currentFocusIndex === 1) {
          return;
        }
        if (isLastItem && currentFocusIndex === 2) {
          step = 2;
        }
        isRoving.current = true;
        setCurrentFocusIndex((index) => Math.max(0, index - step));
        return;
      }

      if (key === forward) {
        evt.preventDefault();
        if (isLastItem && currentFocusIndex === 0) {
          step = 2;
        }

        isRoving.current = true;
        setCurrentFocusIndex((index) => Math.min(items.length - 1, index + step));
        return;
      }

      isRoving.current = false;
    },
    [orientation, isFirstItem, currentFocusIndex, isLastItem, items.length]
  );

  const getTabIndex = (item: string) => {
    if (totalItems === 1 && (item === "duplicate" || item === "removeFromSet")) return 0;

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
    isRoving,
  };
};
