import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { InfoIcon } from "@components/form-builder/icons";

export const InfoButton = ({ label }: { label: string }) => {
  return (
    <>
      <InfoIcon className="ml-4 inline-block" />
      <span className="ml-2 inline-block">{label}</span>
    </>
  );
};

export const PopOver = ({
  buttonContent,
  children,
}: {
  buttonContent?: JSX.Element;
  children: React.ReactNode;
}) => {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button>{buttonContent}</button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          style={{ zIndex: 20000 }}
          align="center"
          className="bg-gray-200 rounded-lg p-4 shadow-md"
        >
          <PopoverPrimitive.Arrow className="fill-current text-white dark:text-gray-200" />
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
