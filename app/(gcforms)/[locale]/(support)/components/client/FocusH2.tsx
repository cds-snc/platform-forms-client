"use client";
import { useFocusHeading } from "@root/lib/hooks/useFocusHeading";
import { ReactElement, useRef } from "react";

export const FocusH2 = ({
  children,
  group,
}: {
  children: ReactElement | string;
  group?: string; // Optional group prop to identify the section
}) => {
  const headingSuccessRef = useRef(null);

  useFocusHeading(headingSuccessRef);

  return (
    <h2 key={group} tabIndex={-1} data-group={group} data-testid="focus-h2" ref={headingSuccessRef}>
      {children}
    </h2>
  );
};
