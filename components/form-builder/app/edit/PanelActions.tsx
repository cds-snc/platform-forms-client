import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { useMediaQuery } from "usehooks-ts";

import { FormElementTypes, FormElement } from "@lib/types";
import { Button } from "../shared";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { ElementOptionsFilter, FormElementWithIndex } from "@components/form-builder/types";
import {
  ChevronDown,
  ChevronUp,
  Close,
  Duplicate,
  ThreeDotsIcon,
  AddIcon,
} from "@components/form-builder/icons";

import { usePanelActions } from "@components/form-builder/hooks";
import { ElementDialog } from "./elements/element-dialog/ElementDialog";

const buttonClasses =
  "group/button border-none transition duration-100 h-0 !py-5 lg:!pb-3 !pl-4 !pr-2 m-1 !bg-transparent xl:hover:!bg-gray-600 xl:hover:!text-white focus:!bg-blue-hover focus:text-black xl:focus:text-white active:text-white disabled:!bg-transparent";
const iconClasses =
  "group-hover/button:fill-black group-disabled/button:!fill-gray-500 group-active/button:!fill-white group-focus/button:!fill-white xl:!fill-black xl:group-hover/button:!fill-white transition duration-100";

export interface RenderMoreFunc {
  ({ item, moreButton }: { item: FormElementWithIndex; moreButton: JSX.Element | undefined }):
    | React.ReactElement
    | string
    | undefined;
}

export const PanelActions = ({
  item,
  subIndex,
  renderMoreButton,
  handleAdd,
  handleRemove,
  handleMoveUp,
  handleMoveDown,
  handleDuplicate,
  filterElements,
  elements,
  lang,
}: {
  item: FormElementWithIndex;
  subIndex?: number;
  renderMoreButton: RenderMoreFunc;
  handleAdd: (index: number, type?: FormElementTypes) => void;
  handleRemove: () => void;
  handleMoveUp: () => void;
  handleMoveDown: () => void;
  handleDuplicate: () => void;
  filterElements?: ElementOptionsFilter;
  elements: FormElement[];
  lang: string;
}) => {
  const { t } = useTranslation("form-builder");

  const isInit = useRef(false);
  const isLastItem = item.index === elements.length - 1;
  const isFirstItem = item.index === 0;
  const isRichText = item.type == "richText";
  const isSubElement = subIndex !== -1 && subIndex !== undefined;

  const getPanelButtons = () => {
    if (isSubElement) {
      return [
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
        {
          id: 3,
          txt: "removeFromSet",
          icon: Close,
          onClick: handleRemove,
        },
        {
          id: 4,
          txt: "addToSet",
          icon: AddIcon,
          onClick: handleOpenDialog,
        },
        {
          id: 5,
          txt: "more",
          icon: ThreeDotsIcon,
          onClick: () => null,
        },
      ];
    }
    return [
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
      {
        id: 3,
        txt: "duplicate",
        icon: Duplicate,
        onClick: handleDuplicate,
      },
      {
        id: 4,
        txt: "remove",
        icon: Close,
        onClick: handleRemove,
      },
      {
        id: 5,
        txt: "more",
        icon: ThreeDotsIcon,
        onClick: () => null,
      },
    ];
  };

  const panelButtons = getPanelButtons();
  const isXl = useMediaQuery("(max-width: 992px)");

  const [elementDialog, showElementDialog] = useState(false);

  const handleOpenDialog = useCallback(() => {
    showElementDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    showElementDialog(false);
  }, []);

  const { handleNav, getTabIndex, currentFocusIndex, itemsRef, setRef } = usePanelActions({
    panelButtons,
    isFirstItem,
    isLastItem,
    elementsLength: elements.length,
    orientation: isSubElement ? "horizontal" : isXl ? "horizontal" : "vertical",
  });

  useEffect(() => {
    if (!isInit.current) {
      isInit.current = true;
      return;
    }
    const index = `button-${currentFocusIndex}` as unknown as number;
    const el = itemsRef.current[index];
    if (el) {
      el.focus();
    }
  }, [currentFocusIndex, isInit, itemsRef]);

  const actions = panelButtons.map((button, loopIndex) => {
    const Icon = button.icon;
    return (
      <Button
        key={button.txt}
        className={`${isFirstItem ? "disabled" : ""} ${buttonClasses}`}
        disabled={button.disabled && button.disabled}
        theme="panelActions"
        iconWrapperClassName="!w-7 !mr-0"
        icon={<Icon className={`${iconClasses}`} />}
        onClick={button.onClick}
        tabIndex={getTabIndex(button.txt)}
        buttonRef={setRef(`button-${loopIndex}`)}
        dataTestId={button.txt}
      >
        <span className="text-sm">{t(button.txt)}</span>
      </Button>
    );
  });

  const moreButton = actions.pop();

  const outerPanelClasses = isSubElement
    ? ``
    : `absolute invisible group-[.active]:visible xl:visible xl:relative right-0 top-0 -mr-[155px] xl:mr-0`;

  const innerPanelClasses = isSubElement
    ? `flex flex-wrap flex-row ${lang}`
    : `bg-violet-50 rounded-lg xl:rounded-none border-violet-400 border xl:border-0 xl:bg-gray-200 ml-10 xl:ml-0 xl:px-6 xl:px-0 py-4 lg:py-0 flex flex-wrap flex-col xl:flex-row ${lang}`;

  return (
    <div>
      <div className={outerPanelClasses}>
        <div
          className={innerPanelClasses}
          role="toolbar"
          aria-label={t("elementActions")}
          onKeyDown={handleNav}
          data-testid="panel-actions"
        >
          {actions}
          {!isRichText && renderMoreButton && renderMoreButton({ item, moreButton })}
        </div>

        {elementDialog && (
          <ElementDialog
            filterElements={filterElements}
            handleAddType={(type) => {
              handleAdd && handleAdd(item.index, type);
            }}
            handleClose={handleCloseDialog}
          />
        )}
      </div>
      {!isSubElement && (
        <div className="flex">
          <div className="mx-auto bottom-0 -mb-5 xl:mr-2 z-10">
            <AddElementButton
              position={item.index}
              handleAdd={handleAdd}
              filterElements={filterElements}
              text={isSubElement ? t("addToSet") : t("addElement")}
            />
          </div>
        </div>
      )}
    </div>
  );
};
