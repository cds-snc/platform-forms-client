"use client";
import React from "react";
import { LangSwitcher } from "@formBuilder/components/shared/LangSwitcher";
import { SaveButton } from "@formBuilder/components/shared/SaveButton";
import { useSession } from "next-auth/react";

export const PreviewNavigation = () => {
  const { status } = useSession();

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 mt-2">
        {/* 
            SaveButton should mostly be invisible, but is here to handle 
            autosave when opening a form file to prevent errors on Settings 
        */}
        {status === "authenticated" && <SaveButton />}
      </div>
      <div className="absolute right-0 top-0">
        <LangSwitcher descriptionLangKey="previewingIn" />
      </div>
    </div>
  );
};
