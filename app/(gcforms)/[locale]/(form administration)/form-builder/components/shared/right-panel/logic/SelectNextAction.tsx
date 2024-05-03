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
  const selectedGroup = formGroups[selectedGroupId];

  if (selectedGroupId === "end") {
    <div>
      <h3 className="block text-sm font-normal">
        <strong>Section:</strong> End{" "}
      </h3>
    </div>;
  }

  if (!selectedGroup) {
    return null;
  }

  if (!item && !Array.isArray(selectedGroupNextActions)) {
    // No "question" selected handle section->section next actions
    // section 1 => section 2
    const sectionName = selectedGroupId ? selectedGroup?.name : null;
    return (
      <div>
        <h3 className="block text-sm font-normal">
          <strong>Section:</strong> {sectionName}{" "}
        </h3>
        <SingleActionSelect nextAction={selectedGroupNextActions || "end"} />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  // If we have an item a question is selected
  const sectionName = selectedGroupId ? selectedGroup?.name : null;
  return (
    <div>
      <h3 className="block text-sm font-normal">
        <strong>Section:</strong> {sectionName}{" "}
      </h3>
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
