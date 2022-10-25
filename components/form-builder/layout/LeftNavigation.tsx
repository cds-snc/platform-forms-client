import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, ShareIcon, PublishIcon } from "../icons";

function Link({
  children,
  handleClick,
  icon,
  isCurrentTab,
}: {
  children?: JSX.Element | string;
  handleClick: (evt: React.MouseEvent<HTMLElement>) => void;
  icon: ReactElement;
  isCurrentTab: boolean;
}) {
  return (
    <button
      className={`${
        isCurrentTab ? "font-bold " : ""
      }group no-underline rounded block mb-4 -ml-1 pl-1 pr-2 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default`}
      onClick={handleClick}
    >
      {icon}
      {children}
    </button>
  );
}

export const LeftNavigation = ({
  currentTab,
  handleClick,
}: {
  currentTab: string;
  handleClick: (tabName: string) => (evt: React.MouseEvent<HTMLElement>) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const iconClassname =
    "inline-block group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <div className="col-span-3">
      <Link
        isCurrentTab={currentTab === "start"}
        icon={<DesignIcon className={iconClassname} />}
        handleClick={handleClick("start")}
      >
        {t("start")}
      </Link>
      <Link
        isCurrentTab={currentTab === "create"}
        icon={<PreviewIcon className={iconClassname} />}
        handleClick={handleClick("create")}
      >
        {t("design")}
      </Link>
      <Link
        isCurrentTab={currentTab === "preview"}
        icon={<ShareIcon className={iconClassname} />}
        handleClick={handleClick("preview")}
      >
        {t("preview")}
      </Link>
      <Link
        isCurrentTab={currentTab === "save"}
        icon={<PublishIcon className={iconClassname} />}
        handleClick={handleClick("save")}
      >
        {t("save")}
      </Link>
    </div>
  );
};
