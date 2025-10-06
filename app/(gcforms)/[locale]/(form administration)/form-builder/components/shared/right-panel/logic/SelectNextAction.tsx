"use client";
import React from "react";

import { FormElement } from "@lib/types";
import { type GroupsType } from "@gcforms/types";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { SingleActionSelect } from "./SingleActionSelect";
import { MultiActionSelector } from "./MultiActionSelector";
import { ClearMultiRules } from "./ClearMultiRules";
import { SectionName } from "./SectionName";
import { Language } from "@lib/types/form-builder-types";
import { t } from "i18next";
import Link from "next/link";
import { Trans } from "react-i18next";
import { showReviewPage as hasReviewPage } from "@lib/utils/form-builder/showReviewPage";

export const SelectNextAction = ({
  item,
  lang,
  id,
}: {
  item: FormElement | null;
  lang: Language;
  id: string;
}) => {
  const typesWithOptions = ["radio", "checkbox", "select", "dropdown"];
  const getGroupNextAction = useGroupStore((state) => state.getGroupNextAction);
  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};

  const form = useTemplateStore((s) => s.form) || {};
  const hasReview = hasReviewPage(form);

  const selectedGroupId = useGroupStore((state) => state.id);
  const selectedGroupNextActions = getGroupNextAction(selectedGroupId);
  const selectedGroup = formGroups[selectedGroupId];
  const sectionName = selectedGroupId ? selectedGroup?.name : null;

  // Check if groups has pages outside of the defaults
  const hasPages = Object.keys(formGroups).some(
    (key) => key !== "start" && key !== "review" && key !== "end"
  );

  const questionsUrl = `/${lang}/form-builder/${id}/edit`;

  if (!hasPages) {
    return (
      <>
        <div className="sticky top-0 z-10 flex justify-between border-b-2 border-black bg-gray-50 p-3 align-middle">
          <SectionName lang={lang} sectionName={sectionName} />
        </div>
        <div className="p-4">
          <Trans
            ns="form-builder"
            i18nKey="logic.noPages.text1"
            defaults="<strong></strong>" // indicate to translator: text with strong HTML element
            components={{ strong: <strong /> }}
          ></Trans>{" "}
          <Link href={questionsUrl}>{t("logic.noPages.text2", { ns: "form-builder" })}</Link>{" "}
          {t("logic.noPages.text3", { ns: "form-builder" })}
        </div>
      </>
    );
  }

  if (selectedGroupId === "end" || selectedGroupId === "review") {
    return (
      <div>
        <div className="flex justify-between border-b-2 border-black bg-gray-50 p-3 align-middle">
          <SectionName lang={lang} sectionName={sectionName} hasReview={hasReview} />
        </div>
        <div className="p-4">
          <Trans
            ns="form-builder"
            i18nKey="logic.endPage.description"
            defaults="<strong></strong>" // indicate to translator: text with strong HTML element
            components={{ strong: <strong /> }}
          ></Trans>
        </div>
      </div>
    );
  }

  if (!selectedGroup) {
    return null;
  }

  // No "question" selected handle section->section next actions
  // section 1 => section 2
  if (!item && !Array.isArray(selectedGroupNextActions)) {
    return (
      <div>
        {selectedGroupNextActions === "exit" && (
          <div className="bg-gray-50 p-3">
            <SingleActionSelect
              key={`single-action-select-${selectedGroupId}`}
              nextAction={selectedGroupNextActions || "end"}
            />
          </div>
        )}

        {selectedGroupNextActions !== "exit" && (
          <>
            <div className="flex justify-between border-b-2 border-black bg-gray-50 p-3 align-middle">
              <SectionName lang={lang} sectionName={sectionName} />
            </div>
            <SingleActionSelect
              key={`single-action-select-${selectedGroupId}`}
              nextAction={selectedGroupNextActions || "end"}
            />
          </>
        )}
      </div>
    );
  }

  // No "question" selected but ... array of next actions is set
  // Allow the user to clear the multi rules
  if (!item) {
    return (
      <div>
        <ClearMultiRules />
      </div>
    );
  }

  // If we have an item a question is selected
  return (
    <div className="m-0 h-[calc(100vh-150px)] w-full overflow-scroll">
      {typesWithOptions.includes(item.type) ? (
        /* 
          If the item (form element) has options 
          we need to show the multi action selector 
          to allow the user to select the next actions
          based on an option value
          yes - => section 1
          no - => section 2
        */
        <MultiActionSelector
          key={`multi-action-select-${selectedGroupId}`}
          lang={lang}
          sectionName={sectionName}
          item={item}
          initialNextActionRules={
            Array.isArray(selectedGroupNextActions) ? selectedGroupNextActions : [] // Default to end
          }
        />
      ) : null}
    </div>
  );
};
