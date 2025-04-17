"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { useMediaQuery } from "usehooks-ts";

import { FormElementTypes } from "@lib/types";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { ElementOptionsFilter, FormElementWithIndex } from "@lib/types/form-builder-types";
import {
  ChevronDown,
  ChevronUp,
  Close,
  Duplicate,
  ThreeDotsIcon,
  AddIcon,
} from "@serverComponents/icons";

import { usePanelActions } from "@lib/hooks/form-builder/usePanelActions";
import { ElementDialog } from "./elements/element-dialog/ElementDialog";
import { PanelActionsButton } from "./PanelActionsButton";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

export const PanelActions = ({
  item,
  isFirstItem,
  isLastItem,
  totalItems,
  isSubPanel,
  handleAdd,
  handleRemove,
  handleMoveUp,
  handleMoveDown,
  handleDuplicate,
  filterElements,
}: {
  item: FormElementWithIndex;
  isFirstItem: boolean;
  isLastItem: boolean;
  totalItems: number;
  isSubPanel?: boolean;
  handleAdd: (type?: FormElementTypes) => void;
  handleRemove: () => void;
  handleMoveUp: () => void;
  handleMoveDown: () => void;
  handleDuplicate: () => void;
  filterElements?: ElementOptionsFilter;
}) => {
  const { t, i18n } = useTranslation("form-builder");

  const { Event } = useCustomEvent();

  const isInit = useRef(false);
  const lang = i18n.language;
  const hasMoreButton = item.type !== "richText";

  const getPanelButtons = ({ hasMoreButton }: { hasMoreButton: boolean }) => {
    const panelButtons = [
      {
        id: 1,
        txt: "moveUp",
        icon: ChevronUp,
        onClick: handleMoveUp,
        disabled: isFirstItem,
      },
      {
        id: 2,
        txt: "moveDown",
        icon: ChevronDown,
        onClick: handleMoveDown,
        disabled: isLastItem,
      },
      ...(isSubPanel
        ? [
            {
              id: 3,
              txt: "removeFromSet",
              icon: Close,
              onClick: handleRemove,
              disabled: false,
            },
            {
              id: 4,
              txt: "addToSet",
              icon: AddIcon,
              onClick: () => {
                handleOpenDialog();
              },
              disabled: false,
            },
          ]
        : [
            {
              id: 3,
              txt: "duplicate",
              icon: Duplicate,
              onClick: handleDuplicate,
              disabled: false,
            },
            {
              id: 4,
              txt: "remove",
              icon: Close,
              onClick: handleRemove,
              disabled: false,
            },
          ]),
      ...(hasMoreButton
        ? [
            {
              id: 5,
              txt: "more",
              icon: ThreeDotsIcon,
              onClick: () => {
                Event.fire(EventKeys.openMoreDialog, { itemId: item.id });
              },
              disabled: false,
            },
          ]
        : []),
    ];

    return panelButtons;
  };

  const panelButtons = getPanelButtons({ hasMoreButton });
  const isXl = useMediaQuery("(max-width: 992px)");

  const [elementDialog, showElementDialog] = useState(false);

  const handleOpenDialog = useCallback(() => {
    showElementDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    showElementDialog(false);
  }, []);

  const { handleNav, getTabIndex, currentFocusIndex, itemsRef, setRef, isRoving } = usePanelActions(
    {
      panelButtons,
      isFirstItem,
      isLastItem,
      totalItems,
      orientation: isSubPanel ? "horizontal" : isXl ? "horizontal" : "vertical",
    }
  );

  useEffect(() => {
    if (!isInit.current) {
      isInit.current = true;
      return;
    }
    const index = `button-${currentFocusIndex}` as unknown as number;
    const el = itemsRef.current[index];
    // focus the element if we're navigating the menu
    if (el && isRoving.current) {
      el.focus();
    }
  }, [currentFocusIndex, isInit, itemsRef, isRoving]);

  const actions = panelButtons.map((button, loopIndex) => {
    // const Icon = button.icon;
    return (
      <PanelActionsButton
        key={button.txt}
        className={`${isFirstItem ? "disabled" : ""} ${isSubPanel ? "!px-2" : ""}`}
        disabled={button.disabled && button.disabled}
        icon={button.icon}
        onClick={button.onClick}
        tabIndex={getTabIndex(button.txt)}
        buttonRef={setRef(`button-${loopIndex}`)}
        dataTestId={button.txt}
        isSubPanel={isSubPanel}
      >
        <span className="text-sm">{t(button.txt)}</span>
      </PanelActionsButton>
    );
  });

  const outerPanelClasses = isSubPanel
    ? ""
    : `z-50 laptop:absolute laptop:invisible laptop:group-[.active]:visible laptop:group-focus-within:visible laptop:right-0 laptop:top-0 ${
        lang === "fr" ? "laptop:-mr-[230px]" : "laptop:-mr-[160px]"
      }`;

  const innerPanelClasses = isSubPanel
    ? `flex flex-wrap flex-row justify-between laptop:mx-0 mb-2 !-ml-5 !mr-5`
    : `flex flex-wrap flex-row justify-between bg-slate-800 px-4 pb-6 pt-4 py-2`;

  const innerPanelResponsiveClasses = isSubPanel
    ? ""
    : "laptop:flex-col laptop:flex-wrap laptop:bg-violet-50 laptop:rounded-lg laptop:border laptop:border-violet-400 laptop:px-2 laptop:py-4";

  return (
    <div>
      <div className={outerPanelClasses}>
        <div
          className={`${innerPanelClasses} ${innerPanelResponsiveClasses}`}
          role="toolbar"
          aria-label={t("elementActions")}
          onKeyDown={handleNav}
          data-testid="panel-actions"
        >
          {actions}
        </div>

        {elementDialog && isSubPanel && (
          <ElementDialog
            filterElements={filterElements}
            handleAddType={handleAdd}
            handleClose={handleCloseDialog}
          />
        )}
      </div>
      {!isSubPanel && (
        <div className="flex">
          <div className="absolute bottom-[-44px] left-1/2 z-10 -translate-x-1/2 laptop:-bottom-7">
            <AddElementButton
              handleAdd={handleAdd}
              filterElements={filterElements}
              text={t("addElement")}
            />
          </div>
        </div>
      )}
    </div>
  );
};
