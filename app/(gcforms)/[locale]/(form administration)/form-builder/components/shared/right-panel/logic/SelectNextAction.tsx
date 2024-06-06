"use client";
import React from "react";

import { FormElement } from "@lib/types";
import { GroupsType } from "@lib/formContext";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { SingleActionSelect } from "./SingleActionSelect";
import { MultiActionSelector } from "./MultiActionSelector";
import { ClearMultiRules } from "./ClearMultiRules";
import { SectionName } from "./SectionName";

export const SelectNextAction = ({ item }: { item: FormElement | null }) => {
  const typesWithOptions = ["radio", "checkbox", "select", "dropdown"];
  const getGroupNextAction = useGroupStore((state) => state.getGroupNextAction);
  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};

  const selectedGroupId = useGroupStore((state) => state.id);
  const selectedGroupNextActions = getGroupNextAction(selectedGroupId);
  const selectedGroup = formGroups[selectedGroupId];
  const sectionName = selectedGroupId ? selectedGroup?.name : null;

  if (selectedGroupId === "end" || selectedGroupId === "review") {
    return (
      <div className="flex justify-between border-b-2 border-black bg-gray-50 p-3 align-middle">
        <SectionName sectionName={sectionName} />
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
        <div className="flex justify-between border-b-2 border-black bg-gray-50 p-3 align-middle">
          <SectionName sectionName={sectionName} />
        </div>
        <div className="p-4">
          <SingleActionSelect nextAction={selectedGroupNextActions || "end"} />
        </div>
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
    <div>
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
