import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * The main use is to provide a global "Skip to content" link. This works with the PageHeader
 * component that has an H1 with a default id set to "#pageHeading". So they're coupled together.
 *
 * Another use is to send focus to another part of the app like a form control.
 * e.g. see DownloadTable.tsx
 */
export const SkipLink = ({
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
