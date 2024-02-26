"use client";
import React from "react";
import { LangSwitcher } from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/LangSwitcher";

export const PreviewNavigation = () => {
  return (
    <div className="relative">
      <div className="absolute right-0 top-0">
        <LangSwitcher descriptionLangKey="previewingIn" />
      </div>
    </div>
  );
};
