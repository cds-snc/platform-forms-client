"use client";
import React from "react";

import { FormElement } from "@lib/types";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

import { SingleActionSelect } from "./SingleActionSelect";
import { MultiActionSelector } from "./MultiActionSelector";

export const SelectNextAction = ({ item }: { item: FormElement | null }) => {
  const getId = useGroupStore((state) => state.getId);
  const getGroupNextAction = useGroupStore((state) => state.getGroupNextAction);
  const typesWithOptions = ["radio", "checkbox", "select"];
  const currentNextActions = getGroupNextAction(getId());

  if (!item && !Array.isArray(currentNextActions)) {
    // No "question" selected handle section->section next actions
    // section 1 => section 2
    return (
      <div>
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
      ) : (
        <div>
          {!Array.isArray(currentNextActions) && (
            /* If it's a question without options 
               we need to show the single action selector 
               to allow the user to select the next action
               section 1 => section 2
            */
            <SingleActionSelect nextAction={currentNextActions} item={item} />
          )}
        </div>
      )}
    </div>
  );
};
