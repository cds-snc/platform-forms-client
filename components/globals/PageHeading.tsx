import React from "react";

interface Props {
  children: React.ReactNode;
  id?: string;
  className?: string;
  ref?: React.LegacyRef<HTMLHeadingElement>;
}

type Ref = HTMLHeadingElement;

/**
 * Creates a generic page header that is programmatically focussable. The main use for this is with
 * SkipLinkFormbuilder to act as the target anchor.
 *
 * Note: the "ref" is used by some components to add behavior like focussing the header on load.
 *
 * Example:
 *  <PageHeading>Heading Text</PageHeading>
 */
const PageHeading = React.forwardRef<Ref, Props>((props, ref) => {
  const {
    children,
    id = "pageHeading",
    className, // TODO: consider a default customized heading class?
  } = props;

  // The default "id" is used by SkipLinkFormbuilder, only change the id if it's NOT being used as
  // the main H1 heading. e.g. to focus a button or something like that.
  return (
    <h1 id={id} {...(className && { className })} tabIndex={-1} {...(ref && { ref })}>
      {children}
    </h1>
  );
});

PageHeading.displayName = "PageHeading";

export { PageHeading };
