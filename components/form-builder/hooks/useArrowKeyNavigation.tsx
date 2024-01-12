import { useRef, useEffect, ElementRef } from "react";

export enum Selectors {
  BUTTON = "button",
  INPUT = "input",
  ANCHOR = "a",
}

function handleEnterClick({
  event,
  currentIndex,
  activeElement,
}: {
  event: KeyboardEvent;
  currentIndex: number;
  activeElement: HTMLElement;
}) {
  if (currentIndex === -1) return;

  activeElement.click();
  event.preventDefault();
}

function handleArrowKey({
  event,
  currentIndex,
  availableElements,
  orientation,
}: {
  event: KeyboardEvent;
  currentIndex: number;
  availableElements: NodeListOf<HTMLElement>;
  orientation: "vertical" | "horizontal";
}) {
  // If the focus isn't in the container, focus on the first thing
  if (currentIndex === -1) availableElements[0].focus();

  let nextElement;

  // Horizontal navigation
  if (orientation === "horizontal") {
    if (event.key === "ArrowLeft") {
      nextElement = availableElements[currentIndex - 1];
    }

    if (event.key === "ArrowRight") {
      nextElement = availableElements[currentIndex + 1];
    }
  }

  // Vertical navigation
  if (orientation === "vertical") {
    if (event.key === "ArrowUp") {
      nextElement = availableElements[currentIndex - 1];
    }

    if (event.key === "ArrowDown") {
      nextElement = availableElements[currentIndex + 1];
    }
  }

  nextElement && nextElement.focus();
  event.preventDefault();
}

const handleEvents = ({
  event,
  parentNode,
  selectors,
  orientation = "horizontal",
  handleEnter = handleEnterClick,
}: {
  event: KeyboardEvent;
  parentNode: HTMLElement | null;
  selectors: Selectors[];
  orientation?: "vertical" | "horizontal";
  handleEnter?: ({
    event,
    currentIndex,
    activeElement,
  }: {
    event: KeyboardEvent;
    currentIndex: number;
    activeElement: HTMLElement;
  }) => void;
}) => {
  if (!parentNode) return;

  const key = event.key;
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(key)) {
    return;
  }

  const activeElement = document.activeElement as HTMLElement;

  // If we're not inside the container, don't do anything
  if (!parentNode.contains(activeElement)) return;

  // Get the list of elements we're allowed to scroll through
  const availableElements = parentNode.querySelectorAll(
    selectors.join(",")
  ) as NodeListOf<HTMLElement>;

  // No elements are available to loop through.
  if (!availableElements.length) return;

  // Which index is currently selected
  const currentIndex = Array.from(availableElements).findIndex(
    (availableElement) => availableElement === activeElement
  );

  if (key === "Enter") {
    handleEnter({ event, currentIndex, activeElement });
  }
  handleArrowKey({ event, currentIndex, availableElements, orientation });
};

export default function useArrowKeyNavigation({
  selectors = [Selectors.BUTTON],
  orientation = "horizontal",
}: {
  selectors: Selectors[];
  orientation?: "vertical" | "horizontal";
}) {
  const parentNode = useRef<ElementRef<"div">>(null);

  useEffect(() => {
    const eventHandler = (event: KeyboardEvent) => {
      handleEvents({ event, parentNode: parentNode.current, selectors, orientation });
    };
    document.addEventListener("keydown", eventHandler);
    return () => document.removeEventListener("keydown", eventHandler);
  }, []);

  return parentNode;
}
