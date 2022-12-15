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
  locale?: string;
  // Note: Try not to overuse aria-label. Instead put the label info in the anchor if possible.
  // Keep in mind that the aria-label will override any link text.
  ariaLabel?: string;
  lang?: string;
}

export const StyledLink = (props: StyledLinkProps) => {
  const { children, href = "", className, locale, ariaLabel, lang } = props;
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Link href={href} {...(locale && { locale: locale })} passHref legacyBehavior>
      <WrappedLink
        href={href}
        className={className}
        {...(ariaLabel && { ariaLabel: ariaLabel })}
        {...(lang && { lang: lang })}
        ref={ref}
      >
        {children}
      </WrappedLink>
    </Link>
  );
};

interface WrappedLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  ariaLabel?: string;
  lang?: string;
}

const WrappedLink = React.forwardRef(
  ({ href, ...props }: WrappedLinkProps, ref: React.LegacyRef<HTMLAnchorElement>) => {
    // Note: href is populated by passHref "magic" and is needed for the case of getting the locale
    // prefix in the url. The passed prop href is ignored it seems, so this works. The prop is
    // included above for TypeScript but otherwise not needed.
    const { children, className, ariaLabel, lang } = props;

    return (
      <a
        href={href}
        className={className}
        {...(ariaLabel && { "aria-label": ariaLabel })}
        {...(lang && { lang: lang })}
        ref={ref}
      >
        {children}
      </a>
    );
  }
);
WrappedLink.displayName = "WrappedLink";
export { WrappedLink };
