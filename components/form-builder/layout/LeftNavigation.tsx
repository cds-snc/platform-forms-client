import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { DesignIcon, PreviewIcon, ShareIcon, PublishIcon, SaveIcon } from "../icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useNavigationStore } from "@components/form-builder/store";

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
  const { status } = useSession();
  const router = useRouter();
  const { setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const iconClassname =
    "inline-block group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="col-span-3" aria-label={t("navLabelFormBuilder")}>
      <Button
        isCurrentTab={["create", "translate"].includes(currentTab)}
        icon={<DesignIcon className={iconClassname} />}
        handleClick={() => {
          setTab("create");
          router.push({ pathname: `/form-builder/edit` });
        }}
      >
        {t("edit")}
      </Button>
      <Button
        isCurrentTab={["preview", "test-data-delivery", "settings"].includes(currentTab)}
        icon={<PreviewIcon className={iconClassname} />}
        handleClick={() => {
          setTab("preview");
          router.push({ pathname: `/form-builder/preview` });
        }}
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
        handleClick={() => {
          setTab("publish");
          router.push({ pathname: `/form-builder/publish` });
        }}
      >
        {t("publish")}
      </Button>
    </nav>
  );
};
