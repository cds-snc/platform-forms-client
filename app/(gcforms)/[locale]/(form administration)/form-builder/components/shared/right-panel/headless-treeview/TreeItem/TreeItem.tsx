import { cn } from "@lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { TreeItemProps } from "../types";

import { useElementType } from "../hooks/useElementType";

import { ItemContent } from "./ItemContent";
import { ItemTitle } from "./ItemTitle";
import { ExpandableIcon } from "./ExpandableIcon";
import { DragHandle } from "./DragHandle";
import { EditableInput } from "./EditableInput";
import { DeleteIcon } from "@serverComponents/icons";
import { lockedItems } from "../constants";

export const TreeItem = ({ item, tree, onFocus, onBlur, handleDelete }: TreeItemProps) => {
  const { isFormElement, isSectionElement, isRepeatingSet } = useElementType(item);
  const [isOpening, setIsOpening] = useState(false);
  const openingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = item.isExpanded();

  const canDragItem = !lockedItems.includes(item.getId());

  const canDeleteItem =
    isExpanded &&
    handleDelete &&
    !isFormElement &&
    !isRepeatingSet &&
    !["start", "end"].includes(item.getId());

  const clearOpeningFeedback = () => {
    if (openingTimeoutRef.current) {
      clearTimeout(openingTimeoutRef.current);
      openingTimeoutRef.current = null;
    }

    setIsOpening(false);
  };

  const showOpeningFeedback = () => {
    if (!isSectionElement) {
      return;
    }

    if (isExpanded) {
      clearOpeningFeedback();
      return;
    }

    if (openingTimeoutRef.current) {
      clearTimeout(openingTimeoutRef.current);
    }

    flushSync(() => {
      setIsOpening(true);
    });

    openingTimeoutRef.current = setTimeout(() => {
      setIsOpening(false);
      openingTimeoutRef.current = null;
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (openingTimeoutRef.current) {
        clearTimeout(openingTimeoutRef.current);
      }
    };
  }, []);

  // Get interactive props only when not renaming
  const getInteractiveProps = () => {
    if (item.isRenaming()) {
      return {};
    }

    const itemProps = item.getProps();

    return {
      ...itemProps,
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        showOpeningFeedback();
        itemProps.onClick?.(e);
      },
      onFocus: () => {
        onFocus(item);
      },
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
        itemProps.onBlur?.(e);
        onBlur?.();
      },
      onDoubleClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        tree.getItemInstance(item.getId()).startRenaming();
      },
      onKeyDown: async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          showOpeningFeedback();
        }

        if (e.key === "Delete" || e.key === "Backspace") {
          if (handleDelete) {
            e.preventDefault();
            handleDelete(e);
            return;
          }
        }

        itemProps.onKeyDown?.(e);
      },
    };
  };

  const isOpeningFeedback = isOpening && !isExpanded;

  return (
    <div
      key={item.getId()}
      id={item.getId()}
      aria-busy={isOpeningFeedback || undefined}
      {...getInteractiveProps()}
      className={cn(
        "block max-w-full",
        isFormElement && "outline-none",
        isSectionElement && "-outline-offset-4 outline-indigo-700",
        item.isDraggingOver() && item.isDragTarget() && "border-blue-focus border-1 border-dashed"
      )}
    >
      <ItemContent item={item}>
        <ExpandableIcon item={item} isLoading={isOpeningFeedback} />

        {item.isRenaming() ? <EditableInput item={item} tree={tree} /> : <ItemTitle item={item} />}

        {!item.isRenaming() && <DragHandle canDragItem={canDragItem} />}

        {canDeleteItem && (
          <button
            className="mr-2 flex cursor-pointer items-center justify-center"
            onClick={handleDelete}
          >
            <DeleteIcon title="Delete group" className="scale-50" />
          </button>
        )}
      </ItemContent>
    </div>
  );
};
