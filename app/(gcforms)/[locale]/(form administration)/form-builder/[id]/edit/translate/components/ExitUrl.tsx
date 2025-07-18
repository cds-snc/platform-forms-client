"use client";
import React from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";
import { LanguageLabel } from "@formBuilder/components/shared/LanguageLabel";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { FieldsetLegend } from "./FieldsetLegend";
import { useTranslation } from "@i18n/client";

import { type Group } from "@lib/formContext";

const FieldInput = ({ groupId, val, lang }: { groupId: string; val: string; lang: Language }) => {
  const setExitButtonUrl = useGroupStore((state) => state.setExitButtonUrl);

  const elementId = `element-${groupId}-text-${lang}`;

  return (
    <div className="relative w-1/2 flex-1">
      <LanguageLabel id={`${elementId}-description`} lang={lang}>
        <>{lang}</>
      </LanguageLabel>

      <input
        className="w-full p-4"
        id={elementId}
        aria-describedby={`${elementId}-description`}
        type="text"
        value={val}
        placeholder={"https://"}
        onChange={(e) => {
          setExitButtonUrl({ id: groupId, locale: lang, url: e.target.value });
        }}
      />
    </div>
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
  const { t } = useTranslation("form-builder");

  return (
    <>
      <div>
        <fieldset>
          <FieldsetLegend>{t("logic.exitUrl.label")}</FieldsetLegend>
          <div className="mb-10 flex gap-px divide-x-2 border-y border-r border-gray-300">
            <FieldInput groupId={groupId} val={group[fieldPrimary] || ""} lang={primaryLanguage} />
            <FieldInput
              groupId={groupId}
              val={group[fieldSecondary] || ""}
              lang={secondaryLanguage}
            />
          </div>
        </fieldset>
      </div>
    </>
  );
};
