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
    <div id={id} className={`text-sm pl-2 p-1 ${lang === "en" ? `bg-purple-200` : "bg-red-200"}`}>
      <span className="rounded-full text-white bg-black items-center justify-center px-2 font-bold text-sm mx-2">
        {lang === "en" ? "1" : "2"}
      </span>
      {children}
    </div>
  );
};
