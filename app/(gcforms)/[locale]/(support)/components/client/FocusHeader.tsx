"use client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { ReactElement, useRef, createElement } from "react";

export const FocusHeader = ({
  children,
  tag = "h1",
}: {
  children: ReactElement | string;
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) => {
  const headingSuccessRef = useRef(null);
  useFocusIt({ elRef: headingSuccessRef });

  return createElement(tag, { ref: headingSuccessRef }, children);
};
