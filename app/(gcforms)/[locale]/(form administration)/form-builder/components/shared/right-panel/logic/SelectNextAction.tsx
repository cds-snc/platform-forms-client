"use client";
import React from "react";

import { FormElement } from "@lib/types";
import { GroupsType } from "@lib/formContext";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { SingleActionSelect } from "./SingleActionSelect";
import { MultiActionSelector } from "./MultiActionSelector";

export const SelectNextAction = ({ item }: { item: FormElement | null }) => {
  const typesWithOptions = ["radio", "checkbox", "select"];
  const getGroupNextAction = useGroupStore((state) => state.getGroupNextAction);
  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};

  const selectedGroupId = useGroupStore((state) => state.id);
  const selectedGroupNextActions = getGroupNextAction(selectedGroupId);
  const selectedGroupName = formGroups[selectedGroupId];

  if (!selectedGroupName) {
    return null;
  }

  if (!item && !Array.isArray(selectedGroupNextActions)) {
    // No "question" selected handle section->section next actions
    // section 1 => section 2
    return (
      <div>
        <h4>Section {selectedGroupId && `${selectedGroupName?.name}:`}</h4>
        <SingleActionSelect nextAction={selectedGroupNextActions} />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  // If we have an item a question is selected
  return (
    <div>
      <h4>{selectedGroupId && selectedGroupName?.name}</h4>
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
          item={item}
          initialNextActionRules={
            Array.isArray(selectedGroupNextActions)
              ? selectedGroupNextActions
              : [{ groupId: "end", choiceId: `${item.id}.0` }] // Default to end
          }
        />
      ) : null}
    </div>
  );
};
