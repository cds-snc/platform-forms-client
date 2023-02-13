import { useState, useCallback, KeyboardEvent, useRef } from "react";

import { FormElementWithIndex } from "@components/form-builder/types";
import { FormElement } from "@lib/types";

export const usePanelActions = (item: FormElementWithIndex, elements: FormElement[]) => {
  const itemsRef = useRef<[HTMLButtonElement] | []>([]);
  const isLastItem = item.index === elements.length - 1;
  const isFirstItem = item.index === 0;
  const isRichText = item.type == "richText";

  const buttonClasses =
    "group border-none transition duration-100 h-0 !py-5 lg:!pb-3 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover disabled:!bg-transparent";
  const iconClasses =
    "group-hover:group-enabled:fill-white-default group-disabled:fill-gray-500 group-focus:fill-white-default transition duration-100";

  const [currentFocusIndex, setCurrentFocusIndex] = useState(isFirstItem ? 1 : 0);

  const [items] = useState([
    { id: 1, txt: "moveUp" },
    { id: 2, txt: "moveDown" },
    { id: 3, txt: "duplicate" },
    { id: 4, txt: "remove" },
    { id: 5, txt: "more" },
  ]);

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
    if (elements.length === 1 && item === "duplicate") return 0;

    if (currentFocusIndex === items.findIndex((i) => i.txt === item)) return 0;

    if (currentFocusIndex === 0) {
      if (isFirstItem && item === "moveDown") return 0;
    }

    return -1;
  };

  return {
    buttonClasses,
    iconClasses,
    setRef,
    itemsRef,
    isFirstItem,
    isLastItem,
    isRichText,
    currentFocusIndex,
    handleNav,
    getTabIndex,
  };
};
