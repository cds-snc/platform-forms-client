import { Language } from "@components/form-builder/types";
import React, { ReactElement } from "react";

// Original: absolute right-0 text-sm top-0 pl-2 pr-2 bg-purple-100 border-purple-200 border mr-1 -mt-6

export const LanguageLabel = ({
  id,
  children,
  lang,
}: {
  id: string;
  children: ReactElement;
  lang: Language;
}) => {
  return (
    <div
      id={id}
      className={`absolute right-0 text-sm bottom-0 pl-2 pr-2 bg-purple-100 border-purple-200 border mr-1 ${
        lang === "en" ? `bg-purple-200` : "bg-red-200"
      }`}
    >
      {children}
    </div>
  );
};
