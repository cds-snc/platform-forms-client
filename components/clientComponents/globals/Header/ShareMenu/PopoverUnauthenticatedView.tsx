"use client";

import React from "react";
import { cn } from "@lib/utils";
import { menuItemClass } from "./styles";

type Props = {
  t: (key: string) => string;
  language: string;
  onRequestShare: () => void;
};

export const PopoverUnauthenticatedView = ({ t, language, onRequestShare }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={onRequestShare} className={cn(menuItemClass)}>
        {t("share.file")}
      </button>
      <a href={`/${language}/auth/login`} className={cn(menuItemClass)}>
        {t("loginMenu.login")}
      </a>
    </div>
  );
};
