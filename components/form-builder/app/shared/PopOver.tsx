import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { InfoIcon } from "@components/form-builder/icons";
import { useTranslation } from "next-i18next";

export const PopOver = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation("form-builder");
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button>
          <InfoIcon className="inline-block w-7" />
          {t("autocompleteWhenNotToUse")}!
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="center"
          className="bg-gray-200 z-10000 w-48 rounded-lg p-4 shadow-md"
        >
          <PopoverPrimitive.Arrow className="fill-current text-white dark:text-gray-200" />
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
