import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "next-i18next";
import Link from "next/link";

import {
  ChevronDown,
  ChevronRight,
  ShareIcon,
  LinkIcon,
  ShareExternalLinkIcon,
  CopyIcon,
} from "../../icons";

import { useTemplateStore } from "../../store/useTemplateStore";

interface LinkItem {
  name: string;
  url: string;
}

const getHost = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.host}`;
};

export const ShareDropdown = () => {
  const { t } = useTranslation("form-builder");

  const { getSchema, id: formId } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
  }));

  const linkEn = `${getHost()}/en/id/${formId}`;
  const linkFr = `${getHost()}/fr/id/${formId}`;

  const handleCopyToClipboard = async () => {
    if ("clipboard" in navigator) {
      const stringified = getSchema();
      await navigator.clipboard.writeText(stringified);
    }
  };

  const links: LinkItem[] = [
    {
      name: t("share.enLink"),
      url: linkEn,
    },
    {
      name: t("share.frLink"),
      url: linkFr,
    },
  ];

  return (
    <div className="relative inline-block text-left">
      <DropdownMenuPrimitive.Root>
        {/* main share button */}
        <DropdownMenuPrimitive.Trigger asChild>
          <button className="flex border-black rounded border-2 py-1 px-3 -mt-10">
            <span className="inline-block mr-1">{t("share.title")}</span>
            <ChevronDown className="mt-[2px]" />
          </button>
        </DropdownMenuPrimitive.Trigger>
        {/* end  main share button */}

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={5}
            className={"w-48 rounded-lg px-1.5 py-1 shadow-md md:w-56 bg-white"}
          >
            {/* share.email */}
            <DropdownMenuPrimitive.Item
              onClick={() => {
                alert("share.email");
              }}
              className={
                "flex cursor-default items-center rounded-md px-2 py-2 text-sm outline-none focus:bg-gray-100"
              }
            >
              <ShareIcon className="" />
              <span className="flex-grow ml-2">{t("share.email")}</span>
            </DropdownMenuPrimitive.Item>

            {/* share.link + sub menu */}
            {formId && (
              <DropdownMenuPrimitive.Sub>
                <DropdownMenuPrimitive.SubTrigger
                  className={
                    "flex w-full cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none focus:bg-gray-50 focus:bg-gray-100"
                  }
                >
                  <LinkIcon className="scale-125 mr-3" />
                  <span className="flex-grow">{t("share.link")}</span>
                  <ChevronRight />
                </DropdownMenuPrimitive.SubTrigger>

                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.SubContent
                    className={
                      "origin-radix-dropdown-menu w-full rounded-md px-1 py-1 text-sm shadow-md bg-white"
                    }
                  >
                    {links.map(({ name, url }, i) => (
                      <DropdownMenuPrimitive.Item
                        key={`${name}-${i}`}
                        className="flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm"
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
                              <Link href={url}>
                                <a
                                  href={url}
                                  className="inline-block mr-1 flex text-sm no-underline"
                                >
                                  <ShareExternalLinkIcon className="scale-[70%]" />
                                  <span className="focus:no-underline hover:no-underline inline-block mr-1 ml-1 underline underline-offset-4 text-blue">
                                    {t("share.open")}
                                  </span>
                                </a>
                              </Link>
                            </DropdownMenuPrimitive.Item>
                            {/* end open link */}
                          </div>
                        </div>
                      </DropdownMenuPrimitive.Item>
                    ))}
                  </DropdownMenuPrimitive.SubContent>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Sub>
            )}
            {/* end share.link sub menu */}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
};
