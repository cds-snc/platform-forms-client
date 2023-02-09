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

  const { getSchema, id: formId } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
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

  const handleCopyToClipboard = async () => {
    if ("clipboard" in navigator) {
      const stringified = getSchema();
      await navigator.clipboard.writeText(stringified);
    }
  };

  const menu = links.map(({ name, url }, i) => (
    <DropdownMenuPrimitive.Item
      key={`${name}-${i}`}
      className="outline-none flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm hover:text-white-default hover:bg-gray-600 focus:text-white-default focus:bg-gray-600 [&_svg]:hover:fill-white [&_svg]:focus:fill-white [&_span]:hover:text-white-default [&_span]:focus:text-white-default"
    >
      <div className="flex justify-between">
        <div className="inline-block mr-3 w-[90px]">{name}:</div>
        <div className="flex">
          {/* copy link */}
          <DropdownMenuPrimitive.Item asChild>
            <button
              className="inline-block mr-2 flex"
              onClick={() => {
                handleCopyToClipboard();
              }}
            >
              <CopyIcon className="scale-[80%]" />
              <span className="focus:no-underline hover:no-underline inline-block mr-1 ml-1 text-sm underline underline-offset-4 text-blue">
                {t("share.copy")}
              </span>
            </button>
          </DropdownMenuPrimitive.Item>
          {/* end copy link */}

          {/* open link */}
          <DropdownMenuPrimitive.Item asChild>
            <a href={url} className="inline-block mr-1 flex text-sm no-underline">
              <ShareExternalLinkIcon className="scale-[70%]" />
              <span className="focus:no-underline hover:no-underline inline-block mr-1 ml-1 underline underline-offset-4 text-blue">
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
