"use client";
import React from "react";

import { FormElement } from "@lib/types";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

import { SingleActionSelect } from "./SingleActionSelect";
import { MultiActionSelector } from "./MultiActionSelector";

export const SelectNextAction = ({ item }: { item: FormElement }) => {
  const getId = useGroupStore((state) => state.getId);
  const getGroupNextAction = useGroupStore((state) => state.getGroupNextAction);
  const typesWithOptions = ["radio", "checkbox", "select"];
  const currentNextActions = getGroupNextAction(getId());

  return (
    <div>
      {typesWithOptions.includes(item.type) ? (
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
            <SingleActionSelect item={item} nextAction={currentNextActions} />
          )}
        </div>
      )}
    </div>
  );
};
