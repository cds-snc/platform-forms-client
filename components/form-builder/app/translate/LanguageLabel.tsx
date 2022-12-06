import { Language } from "@components/form-builder/types";
import React, { ReactElement } from "react";

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
      {children}
    </div>
  );
};
