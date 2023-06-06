import React, { useCallback, useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { ChevronDown, ChevronRight, ShareIcon, LinkIcon } from "../../icons";

import { useTemplateStore } from "../../store/useTemplateStore";
import { ShareModal } from "../ShareModal";
import { LinksSubMenu } from "./LinksSubMenu";
import { Button } from "@components/globals";
import { ShareModalUnauthenticated } from "..";

export const ShareDropdown = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const { push } = useRouter();

  const [shareModal, showShareModal] = useState(false);

  const handleCloseDialog = useCallback(() => {
    showShareModal(false);
  }, []);

  const {
    isPublished,
    id: formId,
    name,
  } = useTemplateStore((s) => ({
    id: s.id,
    isPublished: s.isPublished,
    name: s.name,
  }));

  const menuWidth = name ? "w-48" : "w-[400px]";
  const editLink = `${i18n.language}/form-builder/edit?focusTitle=true`;

  return (
    <div className="relative inline-block text-left">
      <DropdownMenuPrimitive.Root>
        {/* main share button */}
        <DropdownMenuPrimitive.Trigger asChild>
          <button className="cursor-pointer flex border-black rounded border-1 py-1 px-3 hover:text-white-default hover:bg-gray-600 focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white">
            <span className="inline-block mr-1">{t("share.title")}</span>
            <ChevronDown className="mt-[2px]" />
          </button>
        </DropdownMenuPrimitive.Trigger>
        {/* end  main share button */}

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={5}
            className={`${menuWidth} rounded-lg px-1.5 py-1 shadow-md bg-white border-1 border-black`}
          >
            {!name && (
              <DropdownMenuPrimitive.Item>
                <span className="flex-grow ml-2 text-sm inline-block w-[400px]">
                  {t("share.missingName.message1")}{" "}
                  {/* note: using a Button here ... using a Link doesn't close the menu */}
                  <Button
                    theme="link"
                    className="inline-block"
                    onClick={() => {
                      push(editLink, undefined, { shallow: true });
                    }}
                  >
                    {t("share.missingName.message2")}
                  </Button>{" "}
                  {t("share.missingName.message3")}
                </span>
              </DropdownMenuPrimitive.Item>
            )}

            {/* share.email */}
            {name && (
              <DropdownMenuPrimitive.Item
                onClick={() => {
                  showShareModal(true);
                }}
                data-share="form-builder-share-email-attempt"
                className={
                  "flex cursor-pointer items-center rounded-md px-2 py-2 text-sm outline-none hover:text-white-default hover:bg-gray-600 focus:text-white-default focus:bg-gray-600 [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
                }
              >
                <ShareIcon className="" />
                <span className="flex-grow ml-2">{t("share.email")}</span>
              </DropdownMenuPrimitive.Item>
            )}

            {/* share.link + sub menu */}
            {formId && name && (
              <DropdownMenuPrimitive.Sub>
                <DropdownMenuPrimitive.SubTrigger
                  className={
                    "flex w-full cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none hover:text-white-default hover:bg-gray-600 focus:text-white-default focus:bg-gray-600 [&_svg]:hover:fill-white [&_svg]:focus:fill-white [&_svg]:fill-black-default"
                  }
                >
                  <LinkIcon className="scale-125 mr-3" />
                  <span className="flex-grow">{t("share.link")}</span>
                  <ChevronRight />
                </DropdownMenuPrimitive.SubTrigger>

                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.SubContent
                    className={
                      "border-1 border-black origin-radix-dropdown-menu w-full rounded-md px-1 py-1 text-sm shadow-md bg-white ml-1"
                    }
                  >
                    {isPublished ? (
                      <LinksSubMenu />
                    ) : (
                      <div className="px-2 py-2 select-none">{t("share.unpublished")}</div>
                    )}
                  </DropdownMenuPrimitive.SubContent>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Sub>
            )}
            {/* end share.link sub menu */}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
      {shareModal && status === "authenticated" && <ShareModal handleClose={handleCloseDialog} />}
      {shareModal && status !== "authenticated" && (
        <ShareModalUnauthenticated handleClose={handleCloseDialog} />
      )}
    </div>
  );
};
