import React from "react";

// Generic page header used with SkipLinkReusable to provide the focussable header a user lands on
// when activating the Skip link anchor.
export const PageHeading = ({
  children,
  id = "pageHeading",
  className = "border-none mb-0 tablet:mb-4 tablet:mr-8",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) => {
  // "id" is used by SkipLinkReusable, only change if NOT being used as the main H1 heading.
  return (
    <h1 className={className} id={id} tabIndex={-1}>
      {children}
    </h1>
  );
};
