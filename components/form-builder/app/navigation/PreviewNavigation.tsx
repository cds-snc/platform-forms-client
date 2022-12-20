import React from "react";
import { LangSwitcher } from "../shared/LangSwitcher";

export const PreviewNavigation = () => {
  return (
    <div className="relative">
      <div className="absolute right-0 top-0">
        <LangSwitcher descriptionLangKey="previewingIn" />
      </div>
    </div>
  );
};
