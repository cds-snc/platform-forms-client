import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { useMediaQuery } from "usehooks-ts";

import { FormElementTypes } from "@lib/types";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { ElementOptionsFilter, RenderMoreFunc } from "@appComponents/form-builder/types";
import {
  ChevronDown,
  ChevronUp,
  Close,
  Duplicate,
  ThreeDotsIcon,
  AddIcon,
} from "@appComponents/form-builder/icons";

import { usePanelActions } from "@appComponents/form-builder/hooks";
import { ElementDialog } from "./elements/element-dialog/ElementDialog";
import { PanelActionsButton } from "./PanelActionsButton";

export const PanelActions = ({
  isFirstItem,
  isLastItem,
  totalItems,
  isSubPanel,
  moreButtonRenderer,
  handleAdd,
  handleRemove,
  handleMoveUp,
  handleMoveDown,
  handleDuplicate,
  filterElements,
}: {
  isFirstItem: boolean;
  isLastItem: boolean;
  totalItems: number;
  isSubPanel?: boolean;
  moreButtonRenderer?: RenderMoreFunc;
  handleAdd: (type?: FormElementTypes) => void;
  handleRemove: () => void;
  handleMoveUp: () => void;
  handleMoveDown: () => void;
  handleDuplicate: () => void;
  filterElements?: ElementOptionsFilter;
}) => {
  const { t, i18n } = useTranslation("form-builder");

  const isInit = useRef(false);
  const lang = i18n.language;
  const hasMoreButton = moreButtonRenderer ? true : false;
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
              onClick: () => null,
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
      >
        <span className="text-sm">{t(button.txt)}</span>
      </PanelActionsButton>
    );
  });

  let moreButton = undefined;

  if (hasMoreButton) {
    moreButton = actions.pop();
  }

  const outerPanelClasses = isSubPanel
    ? ""
    : `laptop:absolute laptop:invisible laptop:group-[.active]:visible laptop:group-active:visible laptop:group-focus-within:visible laptop:right-0 laptop:top-0 ${
        lang === "fr" ? "laptop:-mr-[230px]" : "laptop:-mr-[160px]"
      }`;

  const innerPanelClasses = isSubPanel
    ? `flex flex-wrap flex-row justify-between px-4 pb-6 pt-4 py-2 -mx-12 laptop:mx-0`
    : `flex flex-wrap flex-row justify-between bg-gray-200 px-4 pb-6 pt-4 py-2`;

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
          {moreButtonRenderer && moreButtonRenderer(moreButton)}
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
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-10">
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
