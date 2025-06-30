"use client";
import { ReactElement, useRef, useEffect } from "react";

export const FocusH2 = ({
  children,
  group,
}: {
  children: ReactElement | string;
  group?: string; // Optional group prop to identify the section
}) => {
  const headingSuccessRef = useRef(null);

  useEffect(() => {
    const el = headingSuccessRef.current as unknown as HTMLElement;

    if (el) {
      // Give the DOM a little time to update
      setTimeout(() => {
        el?.focus();
      }, 40);
    }
  }, [group]);

  return (
    <h2 key={group} tabIndex={-1} data-group={group} data-testid="focus-h2" ref={headingSuccessRef}>
      {children}
    </h2>
  );
};
