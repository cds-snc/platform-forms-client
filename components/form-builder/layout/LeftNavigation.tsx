import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, ShareIcon, PublishIcon, SaveIcon } from "../icons";
import { useSession } from "next-auth/react";

function Button({
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
      }group no-underline rounded block xl:w-36 xl:pb-0 xl:pt-2 xl:mb-2 mb-4 -ml-1 pl-1 pr-2 md:pr-0 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default`}
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
  className,
}: {
  currentTab: string;
  handleClick: (tabName: string) => (evt: React.MouseEvent<HTMLElement>) => void;
  className?: string;
}) => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();

  const iconClassname =
    "inline-block xl:block xl:mx-auto group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className={className} aria-label={t("navLabelFormBuilder")}>
      <Button
        isCurrentTab={["create", "translate"].includes(currentTab)}
        icon={<DesignIcon className={iconClassname} />}
        handleClick={handleClick("create")}
      >
        {t("edit")}
      </Button>
      <Button
        isCurrentTab={["preview", "test-data-delivery", "settings"].includes(currentTab)}
        icon={<PreviewIcon className={iconClassname} />}
        handleClick={handleClick("preview")}
      >
        {t("preview")}
      </Button>
      <Button
        isCurrentTab={currentTab === "share"}
        icon={<ShareIcon className={iconClassname} />}
        handleClick={handleClick("share")}
      >
        {t("share")}
      </Button>
      {status !== "authenticated" && (
        <Button
          isCurrentTab={currentTab === "save"}
          icon={<SaveIcon className={iconClassname} />}
          handleClick={handleClick("save")}
        >
          {t("save")}
        </Button>
      )}
      <Button
        isCurrentTab={currentTab === "publish"}
        icon={<PublishIcon className={iconClassname} />}
        handleClick={handleClick("publish")}
      >
        {t("publish")}
      </Button>
    </nav>
  );
};
