import React, { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import { Button } from "../shared/Button";
import { ChevronUp, ChevronDown, Close, Duplicate, ThreeDotsIcon } from "../icons";
import { Modal } from "./Modal";
import { FormElementWithIndex } from "../types";
import { useTemplateStore } from "../store/useTemplateStore";

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
  const { lang, remove, moveUp, moveDown, add, duplicateElement, elements, setFocusInput } =
    useTemplateStore((s) => ({
      lang: s.lang,
      remove: s.remove,
      moveUp: s.moveUp,
      moveDown: s.moveDown,
      add: s.add,
      duplicateElement: s.duplicateElement,
      elements: s.form.elements,
      setFocusInput: s.setFocusInput,
    }));
  const isLastItem = item.index === elements.length - 1;
  const isFirstItem = item.index === 0;
  const isRichText = item.type == "richText";

  const [currentFocusIndex, setCurrentFocusIndex] = useState(isFirstItem ? 1 : 0);

  const itemsRef = useRef<[HTMLButtonElement] | []>([]);
  const [items] = useState([
    { id: 1, txt: "moveUp" },
    { id: 2, txt: "moveDown" },
    { id: 3, txt: "duplicate" },
    { id: 4, txt: "remove" },
    { id: 5, txt: "more" },
  ]);

  useEffect(() => {
    const index = `button-${currentFocusIndex}` as unknown as number;
    const el = itemsRef.current[index];
    if (el) {
      el.focus();
    }
  }, [currentFocusIndex]);

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
    [items, setCurrentFocusIndex, currentFocusIndex]
  );

  const getTabIndex = (item: string) => {
    if (item === "moveUp" && isFirstItem) return -1;
    if (item === "moveDown" && isLastItem) return -1;
    if (elements.length === 1 && item === "duplicate") return 0;

    if (currentFocusIndex === items.findIndex((i) => i.txt === item)) return 0;

    if (currentFocusIndex === 0) {
      if (isFirstItem && item === "moveDown") return 0;
    }

    return -1;
  };

  return (
    <div className="relative">
      <div
        className={`bg-gray-200 px-6 py-4 flex flex-wrap sm:flex-col ${lang}`}
        role="toolbar"
        aria-label={t("elementActions")}
        onKeyDown={handleNav}
      >
        <Button
          theme="secondary"
          className={`${
            isFirstItem ? "disabled" : ""
          } group border-none transition duration-100 h-0 !py-5 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover disabled:!bg-transparent`}
          iconWrapperClassName="!w-7 !mr-0"
          icon={
            <ChevronUp className="group-hover:group-enabled:fill-white-default group-disabled:fill-gray-500 group-focus:fill-white-default transition duration-100" />
          }
          disabled={isFirstItem}
          onClick={() => moveUp(item.index)}
          tabIndex={getTabIndex("moveUp")}
          buttonRef={(el: HTMLButtonElement) => {
            const index = "button-0" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
        >
          <span className="text-sm mx-3 xl:mx-0">{t("moveUp")}</span>
        </Button>
        <Button
          theme="secondary"
          className={`${
            isFirstItem ? "disabled" : ""
          } group border-none transition duration-100 h-0 !py-5 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover disabled:!bg-transparent`}
          iconWrapperClassName="!w-7 !mr-0"
          icon={
            <ChevronDown className="group-hover:group-enabled:fill-white-default group-disabled:fill-gray-500 group-focus:fill-white-default transition duration-100" />
          }
          disabled={isLastItem}
          onClick={() => moveDown(item.index)}
          tabIndex={getTabIndex("moveDown")}
          buttonRef={(el) => {
            const index = "button-1" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
        >
          <span className="text-sm mx-3 xl:mx-0">{t("moveDown")}</span>
        </Button>

        <Button
          theme="secondary"
          className="group border-none transition duration-100 h-0 !py-5 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover"
          iconWrapperClassName="!w-7 !mr-0"
          icon={
            <Duplicate className="group-hover:fill-white-default group-focus:fill-white-default transition duration-100" />
          }
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
        >
          <span className="text-sm mx-3 xl:mx-0">{t("duplicate")}</span>
        </Button>

        <Button
          theme="secondary"
          className="group border-none transition duration-100 h-0 !py-5 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover"
          iconWrapperClassName="!w-7 !mr-0"
          icon={
            <Close className="group-hover:fill-white-default group-focus:fill-white-default transition duration-100" />
          }
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
        >
          <span className="text-sm mx-3 xl:mx-0">{t("remove")}</span>
        </Button>

        {!isRichText && (
          <Modal
            title={t("moreOptions")}
            openButton={
              <Button
                theme="secondary"
                className="group border-none transition duration-100 h-0 !py-5 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover"
                iconWrapperClassName="!w-7 !mr-0"
                icon={
                  <ThreeDotsIcon className="group-hover:fill-white-default group-focus:fill-white-default transition duration-100" />
                }
                onClick={() => null}
                tabIndex={getTabIndex("more")}
                buttonRef={(el) => {
                  const index = "button-4" as unknown as number;
                  if (el && itemsRef.current) {
                    itemsRef.current[index] = el;
                  }
                }}
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

      <div className="absolute right-0 bottom-0 -mb-5 mr-8 xl:mr-2">
        <Button
          onClick={() => {
            setFocusInput(true);
            add(item.index);
          }}
          theme="secondary"
          className="!border-1.5 !py-2 !px-4 leading-6 bg-white text-sm"
          tabIndex={0}
        >
          {t("addElement")}
        </Button>
      </div>
    </div>
  );
};

PanelActions.propTypes = {
  item: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.any]),
  renderSaveButton: PropTypes.func,
};
