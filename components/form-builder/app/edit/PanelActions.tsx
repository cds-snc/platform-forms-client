import React, { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import { useTranslation } from "next-i18next";

import { FormElementTypes } from "@lib/types";
import { Button } from "../shared";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { Modal } from "./Modal";
import { FormElementWithIndex } from "@components/form-builder/types";
import { useTemplateStore } from "@components/form-builder/store";
import {
  ChevronDown,
  ChevronUp,
  Close,
  Duplicate,
  ThreeDotsIcon,
} from "@components/form-builder/icons";

import { isValidatedTextType } from "../../util";

export const PanelActions = ({
  item,
  renderSaveButton,
  children,
}: {
  item: FormElementWithIndex;
  renderSaveButton: () => React.ReactElement | string | undefined;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation("form-builder");
  const {
    lang,
    add,
    updateField,
    remove,
    moveUp,
    moveDown,
    duplicateElement,
    elements,
    setFocusInput,
  } = useTemplateStore((s) => ({
    lang: s.lang,
    add: s.add,
    updateField: s.updateField,
    remove: s.remove,
    moveUp: s.moveUp,
    moveDown: s.moveDown,
    duplicateElement: s.duplicateElement,
    elements: s.form.elements,
    setFocusInput: s.setFocusInput,
  }));
  const isLastItem = item.index === elements.length - 1;
  const isFirstItem = item.index === 0;
  const isRichText = item.type == "richText";

  const [currentFocusIndex, setCurrentFocusIndex] = useState(isFirstItem ? 1 : 0);
  const isInit = useRef(false);

  const getPanelButtons = (item: FormElementWithIndex) => {
    return [
      {
        id: 1,
        txt: "moveUp",
        icon: ChevronUp,
        onClick: () => moveUp(item.index),
        disabled: isFirstItem,
      },
      {
        id: 2,
        txt: "moveDown",
        icon: ChevronDown,
        onClick: () => moveDown(item.index),
        disabled: isLastItem,
      },
      {
        id: 3,
        txt: "duplicate",
        icon: Duplicate,
        onClick: () => {
          setFocusInput(true);
          duplicateElement(item.index);
        },
      },
      {
        id: 4,
        txt: "remove",
        icon: Close,
        onClick: () => {
          // if index is 0, then highlight the form title
          const labelId = item.index === 0 ? "formTitle" : `item${item.index - 1}`;

          remove(item.id);
          document.getElementById(labelId)?.focus();
        },
      },
      {
        id: 5,
        txt: "more",
        icon: ThreeDotsIcon,
        onClick: () => null,
      },
    ];
  };

  const panelButtons = getPanelButtons(item);
  const itemsRef = useRef<[HTMLButtonElement] | []>([]);
  const [items] = useState(panelButtons.map(({ id, txt }) => ({ id, txt })));

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
  }, [currentFocusIndex, isInit]);

  const handleNav = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
      const { key } = evt;
      let step = 1;

      if (key === "ArrowLeft") {
        evt.preventDefault();
        if (isFirstItem && currentFocusIndex === 1) {
          return;
        }
        if (isLastItem && currentFocusIndex === 2) {
          step = 2;
        }
        setCurrentFocusIndex((index) => Math.max(0, index - step));
      }

      if (key === "ArrowRight") {
        evt.preventDefault();
        if (isLastItem && currentFocusIndex === 0) {
          step = 2;
        }
        setCurrentFocusIndex((index) => Math.min(items.length - 1, index + step));
      }
    },
    [items, setCurrentFocusIndex, currentFocusIndex, isFirstItem, isLastItem]
  );

  const getTabIndex = (item: string) => {
    if (elements.length === 1 && item === "duplicate") return 0;

    if (currentFocusIndex === items.findIndex((i) => i.txt === item)) return 0;

    if (currentFocusIndex === 0) {
      if (isFirstItem && item === "moveDown") return 0;
    }

    return -1;
  };

  /* Note this callback is also in PanelActions */
  const handleAddElement = useCallback(
    (index: number, type?: FormElementTypes) => {
      setFocusInput(true);
      add(index, isValidatedTextType(type) ? FormElementTypes.textField : type);
      if (isValidatedTextType(type)) {
        // add 1 to index because it's a new element
        updateField(`form.elements[${index + 1}].properties.validation.type`, type as string);
      }
    },
    [add, setFocusInput, updateField]
  );

  const buttonClasses =
    "group border-none transition duration-100 h-0 !py-5 lg:!pb-3 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover disabled:!bg-transparent";
  const iconClasses =
    "group-hover:group-enabled:fill-white-default group-disabled:fill-gray-500 group-focus:fill-white-default transition duration-100";

  const actions = panelButtons.map((button, loopIndex) => {
    const Icon = button.icon;
    return (
      <Button
        key={button.txt}
        className={`${isFirstItem ? "disabled" : ""} ${buttonClasses}`}
        disabled={button.disabled && button.disabled}
        theme="secondary"
        iconWrapperClassName="!w-7 !mr-0"
        icon={<Icon className={`${iconClasses}`} />}
        onClick={button.onClick}
        tabIndex={getTabIndex(button.txt)}
        buttonRef={(el: HTMLButtonElement) => {
          const index = `button-${loopIndex}` as unknown as number;
          if (el && itemsRef.current) {
            itemsRef.current[index] = el;
          }
        }}
        dataTestId={button.txt}
      >
        <span className="text-sm mx-3 xl:mx-0">{t(button.txt)}</span>
      </Button>
    );
  });

  const moreButton = actions.pop();

  return (
    <div className="relative">
      <div
        className={`bg-gray-200 px-6 lg:px-0 py-4 lg:py-0 flex flex-wrap sm:flex-col ${lang}`}
        role="toolbar"
        aria-label={t("elementActions")}
        onKeyDown={handleNav}
        data-testid="panel-actions"
      >
        {actions}
        {!isRichText && (
          <Modal title={t("moreOptions")} openButton={moreButton} saveButton={renderSaveButton()}>
            {children}
          </Modal>
        )}
      </div>
      <div className="absolute right-0 bottom-0 -mb-5 mr-8 xl:mr-2">
        <AddElementButton position={item.index} handleAdd={handleAddElement} />
      </div>
    </div>
  );
};
