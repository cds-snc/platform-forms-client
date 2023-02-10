import React from "react";
import { useTranslation } from "next-i18next";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useTemplateStore } from "../../store/useTemplateStore";
import { ShareExternalLinkIcon, CopyIcon } from "../../icons";
import { getHost } from "@components/form-builder/util";

interface LinkItem {
  name: string;
  url: string;
}

export const LinksSubMenu = () => {
  const { t } = useTranslation("form-builder");

  const { id: formId } = useTemplateStore((s) => ({
    id: s.id,
  }));

  const links: LinkItem[] = [
    {
      name: t("share.enLink"),
      url: `${getHost()}/en/id/${formId}`,
    },
    {
      name: t("share.frLink"),
      url: `${getHost()}/fr/id/${formId}`,
    },
  ];

  const handleCopyToClipboard = async (link: string) => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(link);
    }
  };

  const menu = links.map(({ name, url }, i) => (
    <DropdownMenuPrimitive.Item
      key={`${name}-${i}`}
      className="outline-none flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm hover:text-white-default hover:bg-gray-600 focus-within:text-white-default focus-within:bg-gray-600 [&_svg]:hover:fill-white [&_svg]:focus-within:fill-white [&_span]:hover:text-white-default [&_span]:focus-within:text-white-default"
    >
      <div className="flex justify-between">
        <div className="inline-block mr-3 w-[90px]">{name}:</div>
        <div className="flex">
          {/* copy link */}
          <DropdownMenuPrimitive.Item asChild>
            <button
              className="[&_span]:focus-within:no-underline text-blue focus:outline focus:outline-white-default focus:outline-offset-2 inline-block mr-2 flex"
              onClick={() => {
                handleCopyToClipboard(url);
              }}
            >
              <CopyIcon className="scale-[80%]" />
              <span className="hover:no-underline underline underline-offset-4 inline-block mr-1 ml-1 text-sm text-blue">
                {t("share.copy")}
              </span>
            </button>
          </DropdownMenuPrimitive.Item>
          {/* end copy link */}

          {/* open link */}
          <DropdownMenuPrimitive.Item asChild>
            <a
              href={url}
              target="_blank"
              className="focus:outline focus:outline-white-default focus:outline-offset-2 inline-block mr-1 flex text-sm no-underline focus:bg-transparent active:bg-transparent active:shadow-none focus:shadow-none focus:outline-offset-2"
              rel="noreferrer"
            >
              <ShareExternalLinkIcon className="scale-[70%]" />
              <span className="hover:no-underline underline underline-offset-4 inline-block mr-1 ml-1">
                {t("share.open")}
              </span>
            </a>
          </DropdownMenuPrimitive.Item>
          {/* end open link */}
        </div>
      </div>
    </DropdownMenuPrimitive.Item>
  ));

  return <>{menu}</>;
};
