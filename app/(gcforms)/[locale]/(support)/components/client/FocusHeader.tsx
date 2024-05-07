"use client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { ReactElement, useRef } from "react";

export const FocusHeader = ({ children }: { children: ReactElement | string }) => {
  const headingSuccessRef = useRef(null);
  useFocusIt({ elRef: headingSuccessRef });

  return <h1 ref={headingSuccessRef}>{children}</h1>;
};
