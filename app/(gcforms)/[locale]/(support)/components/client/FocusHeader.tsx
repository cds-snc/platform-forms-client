"use client";
import { useFocusHeading } from "@lib/hooks/useFocusHeading";
import { ReactNode, useRef } from "react";

export const FocusHeader = ({
  children,
  dataTestId,
  headingTag: HeadingTag = "h1",
}: {
  children: ReactNode;
  headingTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  dataTestId?: string;
}) => {
  const headingSuccessRef = useRef<HTMLHeadingElement | null>(null);

  useFocusHeading(headingSuccessRef);

  return (
    <HeadingTag ref={headingSuccessRef} {...(dataTestId ? { "data-testid": dataTestId } : {})}>
      {children}
    </HeadingTag>
  );
};
