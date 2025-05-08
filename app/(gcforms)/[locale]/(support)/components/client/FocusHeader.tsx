"use client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { ReactElement, useRef } from "react";

export const FocusHeader = ({
  children,
  headingTag: HeadingTag = "h1",
}: {
  children: ReactElement | string;
  headingTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) => {
  const headingSuccessRef = useRef(null);
  useFocusIt({ elRef: headingSuccessRef });

  return <HeadingTag ref={headingSuccessRef}>{children}</HeadingTag>;
};
