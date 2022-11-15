import React, { useRef } from "react";
import Link from "next/link";

// Note: the below seems unnecessarily complex vs. just having the parent Link component pass an
// href to a custom anchor component. But this is the recommended way, so staying with this for now.
// see https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-custom-component-that-wraps-an-a-tag
// see https://nextjs.org/docs/messages/link-passhref
// see https://reactjs.org/docs/react-api.html#reactforwardref

interface StyledLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

export const StyledLink = (props: StyledLinkProps) => {
  const { children, href, className } = props;
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Link href={href} passHref legacyBehavior>
      <WrappedLink to={href} className={className} ref={ref}>
        {children}
      </WrappedLink>
    </Link>
  );
};

// Note: using prop name "to" just encase passHref's implicit passing of href would conflict with
// the prop name "href". It's possible to use the implicit href but then the typescript problem..
interface WrappedLinkProps {
  children: React.ReactNode;
  to: string;
  className?: string;
}

const WrappedLink = React.forwardRef(
  ({ to, ...props }: WrappedLinkProps, ref: React.LegacyRef<HTMLAnchorElement>) => {
    const { children, className } = props;

    return (
      <a href={to} className={className} ref={ref}>
        {children}
      </a>
    );
  }
);
WrappedLink.displayName = "WrappedLink";
export { WrappedLink };
