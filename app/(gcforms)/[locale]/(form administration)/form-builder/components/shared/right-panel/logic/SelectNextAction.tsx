"use client";
import React from "react";

import { FormElement } from "@lib/types";
import { GroupsType } from "@lib/formContext";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

import { SingleActionSelect } from "./SingleActionSelect";
import { MultiActionSelector } from "./MultiActionSelector";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const SelectNextAction = ({ item }: { item: FormElement | null }) => {
  const id = useGroupStore((state) => state.id);

  const getGroupNextAction = useGroupStore((state) => state.getGroupNextAction);
  const typesWithOptions = ["radio", "checkbox", "select"];
  const currentNextActions = getGroupNextAction(id);

  const currentGroup = id;
  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};
  const activeGroupName = formGroups[currentGroup];

  if (!item && !Array.isArray(currentNextActions)) {
    // No "question" selected handle section->section next actions
    // section 1 => section 2
    return (
      <div>
        <h3>{currentGroup && activeGroupName?.name}</h3>
        <SingleActionSelect nextAction={currentNextActions} />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  // If we have an item a question is selected
  return (
    <div>
      <h3>{currentGroup && activeGroupName?.name}</h3>
      {typesWithOptions.includes(item.type) ? (
        /* 
          If it's a question with options 
          we need to show the multi action selector 
          to allow the user to select the next actions
          based on an option value
          yes - => section 1
          no - => section 2
        */
        <MultiActionSelector
          item={item}
          initialNextActionRules={
            Array.isArray(currentNextActions)
              ? currentNextActions
              : [{ groupId: "end", choiceId: `${item.id}.0` }]
          }
        />
      ) : null}
    </div>
  );
};
