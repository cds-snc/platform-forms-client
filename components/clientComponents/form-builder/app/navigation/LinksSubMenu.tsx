"use client";
import React from "react";
import { useTranslation } from "@i18n/client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useTemplateStore } from "../../store/useTemplateStore";
import { ShareExternalLinkIcon, CopyIcon } from "../../../../serverComponents/icons";
import { getHost } from "@clientComponents/form-builder/util";

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
      className="flex cursor-default select-none items-center rounded-md p-2 text-sm outline-none focus-within:bg-gray-600 focus-within:text-white-default hover:bg-gray-600 hover:text-white-default [&_span]:focus-within:text-white-default [&_span]:hover:text-white-default [&_svg]:focus-within:fill-white [&_svg]:hover:fill-white"
    >
      <div className="flex justify-between">
        <div className="mr-3 inline-block w-[90px]">{name}:</div>
        <div className="flex">
          {/* copy link */}
          <DropdownMenuPrimitive.Item asChild>
            <button
              data-share="form-builder-link"
              className="[&_span]:focus-within:no-underline text-blue focus:outline focus:outline-white-default focus:outline-offset-2 inline-block mr-2 flex"
              onClick={() => {
                handleCopyToClipboard(url);
              }}
            >
              <CopyIcon className="scale-[80%]" />
              <span className="mx-1 inline-block text-sm text-blue underline underline-offset-4 hover:no-underline">
                {t("share.copy")}
              </span>
            </button>
          </DropdownMenuPrimitive.Item>
          {/* end copy link */}

          {/* open link */}
          <DropdownMenuPrimitive.Item asChild>
            <a
              data-share="form-builder-link"
              href={url}
              target="_blank"
              className="mr-1 inline-block text-sm no-underline focus:bg-transparent focus:outline focus:outline-offset-2 focus:outline-white-default active:bg-transparent"
              rel="noreferrer"
            >
              <ShareExternalLinkIcon className="scale-[70%]" />
              <span className="mx-1 inline-block underline underline-offset-4 hover:no-underline">
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
