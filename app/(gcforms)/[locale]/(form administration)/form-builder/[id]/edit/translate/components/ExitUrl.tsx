"use client";
import React from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";
import { LanguageLabel } from "@formBuilder/components/shared/LanguageLabel";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";

import { type Group } from "@lib/formContext";

const FieldInput = ({ groupId, val, lang }: { groupId: string; val: string; lang: Language }) => {
  const setExitButtonUrl = useGroupStore((state) => state.setExitButtonUrl);

  return (
    <>
      <LanguageLabel id={`element-${groupId}-en-language`} lang={lang}>
        <>{lang}</>
      </LanguageLabel>
      <input
        className="w-full p-4"
        id={`element-${groupId}-text-${lang}`}
        aria-describedby={`element-${groupId}-choice-en-language`}
        type="text"
        value={val}
        onChange={(e) => {
          setExitButtonUrl({ id: groupId, locale: lang, url: e.target.value });
        }}
      />
    </>
  );
};

export const ExitUrl = ({
  groupId,
  group,
  primaryLanguage,
}: {
  groupId: string;
  group: Group;
  primaryLanguage: Language;
}) => {
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";

  const field = LocalizedElementProperties.EXIT_URL;
  const localizeField = useTemplateStore((s) => s.localizeField);
  const fieldPrimary = localizeField(field, primaryLanguage);
  const fieldSecondary = localizeField(field, secondaryLanguage);

  return (
    <>
      <div>
        <div className="mb-10 flex gap-px divide-x-2 border-y border-r border-gray-300">
          <FieldInput groupId={groupId} val={group[fieldPrimary] || ""} lang={primaryLanguage} />
          <FieldInput
            groupId={groupId}
            val={group[fieldSecondary] || ""}
            lang={secondaryLanguage}
          />
        </div>
      </div>
    </>
  );
};
