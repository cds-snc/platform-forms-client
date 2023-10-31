import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// TODO: Consider replacing or merging this fancier viersion with the existing <SkipLink>

/**
 * Creates a hidden link that when focussed becomes visible. When the user activates the link, the
 * browser focuses the provided anchor id.
 * This is mainly to help screen reader users by skipping "unimportant" content and going right to
 * the main content that is ideally a heading. The heading gives extra context to the user.
 * Another use to send focus to another part of the app like a form control.
 */
export const SkipLinkFormBuilder = ({
  text,
  anchor = "#pageHeading",
  classNameContainer = "w-full absolute z-5 text-center top-2.5",
}: {
  text?: string;
  anchor?: string;
  classNameContainer?: string;
}) => {
  const { t } = useTranslation("common");
  const [isClient, setIsClient] = useState(false);

  // Avoids a possible Hydration error (from i18n I think) by only rendering the related conent
  // when in the client browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={classNameContainer}>
      <a
        href={anchor}
        className="absolute overflow-hidden w-1 h-1 whitespace-nowrap focus:static focus:p-1.5 focus:w-auto focus:h-auto focus:overflow-auto focus:text-center"
      >
        {isClient && (text || t("skip-link"))}
      </a>
    </div>
  );
};
