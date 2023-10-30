import React from "react";

interface Props {
  children: React.ReactNode;
  id?: string;
  "data-testid"?: string;
  className?: string;
  dataTestid?: string;
  ref?: React.LegacyRef<HTMLHeadingElement>;
}

type Ref = HTMLHeadingElement;

/**
 * Creates a generic page header that is programmatically focussable.
 *
 * Note: the "ref" is used by some components to add behavior like focussing the header on load.
 *
 * Example:
 *  <PageHeading>Heading Text</PageHeading>
 */
const PageHeading = React.forwardRef<Ref, Props>((props, ref) => {
  const { children, id = "pageHeading", "data-testid": dataTestid, className } = props;

  // The default "id" is used by SkipLinkFormbuilder, only change the id if it's NOT being used as
  // the main H1 heading. e.g. to focus a button
  return (
    <h1
      id={id}
      {...(dataTestid && { "data-testid": dataTestid })}
      {...(className && { className })}
      {...(ref && { ref })}
      tabIndex={-1}
    >
      {children}
    </h1>
  );
});

PageHeading.displayName = "PageHeading";

export { PageHeading };
