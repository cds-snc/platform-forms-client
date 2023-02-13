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

  const itemsRef = useRef<[HTMLButtonElement] | []>([]);
  const [items] = useState([
    { id: 1, txt: "moveUp" },
    { id: 2, txt: "moveDown" },
    { id: 3, txt: "duplicate" },
    { id: 4, txt: "remove" },
    { id: 5, txt: "more" },
  ]);

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
    "group border-none transition duration-100 h-0 !py-5 lg:!pb-3 !pl-4 !pr-2 m-1 !bg-transparent xl:hover:!bg-gray-600 xl:focus:!bg-blue-hover disabled:!bg-transparent";
  const iconClasses =
    "group-hover:group-enabled:fill-white-default group-disabled:fill-gray-500 group-focus:fill-white-default transition duration-100";

  return (
    <div className="">
      <div className="absolute invisible group-hover:visible xl:visible xl:relative right-0 top-0 -mr-[185px] xl:mr-0">
        <div
          className={`bg-violet-100 rounded-lg xl:rounded-none border-violet-400 border xl:border-0 xl:bg-gray-200 ml-10 xl:ml-0 xl:px-6 xl:px-0 py-4 lg:py-0 flex flex-wrap flex-col xl:flex-row ${lang}`}
          role="toolbar"
          aria-label={t("elementActions")}
          onKeyDown={handleNav}
          data-testid="panel-actions"
        >
          <Button
            theme="secondary"
            className={`${isFirstItem ? "disabled" : ""} ${buttonClasses}`}
            iconWrapperClassName="!w-7 !mr-0"
            icon={<ChevronUp className={`${iconClasses}`} />}
            disabled={isFirstItem}
            onClick={() => moveUp(item.index)}
            tabIndex={getTabIndex("moveUp")}
            buttonRef={(el: HTMLButtonElement) => {
              const index = "button-0" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            dataTestId="move-up"
          >
            <span className="text-sm mx-3 xl:mx-0">{t("moveUp")}</span>
          </Button>
          <Button
            theme="secondary"
            className={`${isFirstItem ? "disabled" : ""} ${buttonClasses}`}
            iconWrapperClassName="!w-7 !mr-0"
            icon={<ChevronDown className={`${iconClasses}`} />}
            disabled={isLastItem}
            onClick={() => moveDown(item.index)}
            tabIndex={getTabIndex("moveDown")}
            buttonRef={(el) => {
              const index = "button-1" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            dataTestId="move-down"
          >
            <span className="text-sm mx-3 xl:mx-0">{t("moveDown")}</span>
          </Button>

          <Button
            theme="secondary"
            className={`${buttonClasses}`}
            iconWrapperClassName="!w-7 !mr-0"
            icon={<Duplicate className={`${iconClasses}`} />}
            onClick={() => {
              setFocusInput(true);
              duplicateElement(item.index);
            }}
            tabIndex={getTabIndex("duplicate")}
            buttonRef={(el) => {
              const index = "button-2" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            dataTestId="duplicate"
          >
            <span className="text-sm mx-3 xl:mx-0">{t("duplicate")}</span>
          </Button>

          <Button
            theme="secondary"
            className={`${buttonClasses}`}
            iconWrapperClassName="!w-7 !mr-0"
            icon={<Close className={`${iconClasses}`} />}
            onClick={() => {
              // if index is 0, then highlight the form title
              const labelId = item.index === 0 ? "formTitle" : `item${item.index - 1}`;

              remove(item.id);
              document.getElementById(labelId)?.focus();
            }}
            tabIndex={getTabIndex("remove")}
            buttonRef={(el) => {
              const index = "button-3" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            dataTestId="remove"
          >
            <span className="text-sm mx-3 xl:mx-0">{t("remove")}</span>
          </Button>

          {!isRichText && (
            <Modal
              title={t("moreOptions")}
              openButton={
                <Button
                  theme="secondary"
                  className={`${buttonClasses}`}
                  iconWrapperClassName="!w-7 !mr-0"
                  icon={<ThreeDotsIcon className={`${iconClasses}`} />}
                  onClick={() => null}
                  tabIndex={getTabIndex("more")}
                  buttonRef={(el) => {
                    const index = "button-4" as unknown as number;
                    if (el && itemsRef.current) {
                      itemsRef.current[index] = el;
                    }
                  }}
                  dataTestId="more"
                >
                  <span className="text-sm mx-3 xl:mx-0">{t("more")}</span>
                </Button>
              }
              saveButton={renderSaveButton()}
            >
              {children}
            </Modal>
          )}
        </div>
      </div>
      <div className="flex">
        <div className="mx-auto bottom-0 -mb-5 xl:mr-2 z-10">
          <AddElementButton position={item.index} handleAdd={handleAddElement} />
        </div>
      </div>
    </div>
  );
};
