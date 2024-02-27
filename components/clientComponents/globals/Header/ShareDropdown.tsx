"use client";
import React, { useCallback, useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";

import { ChevronDown, ChevronRight, ShareIcon, LinkIcon } from "@serverComponents/icons";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ShareModal } from "../../../../app/(gcforms)/[locale]/(form administration)/form-builder/components/ShareModal";
import { LinksSubMenu } from "../../../../app/(gcforms)/[locale]/(form administration)/form-builder/components/navigation/LinksSubMenu";
import { ShareModalUnauthenticated } from "../../../../app/(gcforms)/[locale]/(form administration)/form-builder/components";

import { useRefStore } from "@lib/hooks/form-builder/useRefStore";

export const ShareDropdown = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();

  const [shareModal, showShareModal] = useState(false);

  const { getRef } = useRefStore();

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

  return (
    <div className="relative inline-block text-left">
      <DropdownMenuPrimitive.Root>
        {/* main share button */}
        <DropdownMenuPrimitive.Trigger asChild>
          <button className="flex cursor-pointer rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white">
            <span className="mr-1 inline-block">{t("share.title")}</span>
            <ChevronDown className="mt-[2px]" />
          </button>
        </DropdownMenuPrimitive.Trigger>
        {/* end  main share button */}

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={5}
            className={`${menuWidth} rounded-lg border-1 border-black bg-white px-1.5 py-1 shadow-md`}
          >
            {!name && (
              <DropdownMenuPrimitive.Item
                onClick={() => {
                  setTimeout(() => {
                    getRef("fileNameInput")?.current?.focus();
                  }, 50);
                }}
                className={
                  "flex cursor-pointer items-center rounded-md p-2 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
                }
              >
                {t("share.missingName.message1")}
                <span className="mx-1 underline">{t("share.missingName.message2")}</span>
                {t("share.missingName.message3")}
                <span className="sr-only">{t("share.missingName.message4")}</span>
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
                  "flex cursor-pointer items-center rounded-md p-2 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
                }
              >
                <ShareIcon className="" />
                <span className="ml-2 grow">{t("share.email")}</span>
              </DropdownMenuPrimitive.Item>
            )}

            {/* share.link + sub menu */}
            {formId && name && (
              <DropdownMenuPrimitive.Sub>
                <DropdownMenuPrimitive.SubTrigger
                  className={
                    "flex w-full cursor-pointer select-none items-center rounded-md p-2 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:fill-black-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
                  }
                >
                  <LinkIcon className="mr-3 scale-125" />
                  <span className="grow">{t("share.link")}</span>
                  <ChevronRight />
                </DropdownMenuPrimitive.SubTrigger>

                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.SubContent
                    className={
                      "origin-radix-dropdown-menu ml-1 w-full rounded-md border-1 border-slate-500 bg-white p-1 text-sm shadow-md"
                    }
                  >
                    {isPublished ? (
                      <LinksSubMenu />
                    ) : (
                      <div className="select-none p-2">{t("share.unpublished")}</div>
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
