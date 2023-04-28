import React from "react";

/**
 * Shows an overlay that acts to catch any clicks outside of a component to trigger closing/* the
 * component.
 *
 * Note:  The overlay is set to a `z-index: 40`. The component that uses this must have a greater
 * z-index, e.g. `z-index: 50`. Also any other components behind the overlay must be less than
 * a z-index of 40.
 *
 * Future Thought: if this overlay is heavily used, it would make more sense to become a "singleton"
 * at the App root level and shared among components using something like useContext + custom hook..
 */
export const Overlay = ({
  callback,
  hasOpacity = false,
  hasCursor = false,
}: {
  callback?: () => void;
  hasOpacity?: boolean;
  hasCursor?: boolean;
}) => {
  // This will probably be used by the parent component to hide the overlay but can do anything
  function handleCallback() {
    if (typeof callback === "function") {
      callback();
    }
  }

  return (
    <div
      data-testid="overlay"
      onClick={handleCallback}
      className={`z-40 w-screen h-screen fixed top-0 left-0${hasOpacity ? " bg-black/10" : ""}${
        hasCursor ? " cursor-pointer" : ""
      }`}
      aria-hidden="true" // Not necessary but being ovious
    />
  );
};
