import React, { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import { Button } from "../shared";
import { ChevronUp, ChevronDown, Close, Duplicate, ThreeDotsIcon } from "../../icons";
import { Modal } from "./Modal";
import { FormElementWithIndex } from "../../types";
import { useTemplateStore } from "../../store";

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
  const [isInit, setIsInit] = useState(false);

  const itemsRef = useRef<[HTMLButtonElement] | []>([]);
  const [items] = useState([
    { id: 1, txt: "moveUp" },
    { id: 2, txt: "moveDown" },
    { id: 3, txt: "duplicate" },
    { id: 4, txt: "remove" },
    { id: 5, txt: "more" },
  ]);

  useEffect(() => {
    if (isInit) {
      const index = `button-${currentFocusIndex}` as unknown as number;
      const el = itemsRef.current[index];
      if (el) {
        el.focus();
      }
    }
    setIsInit(true);
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
    if (elements.length === 1 && item === "duplicate") return 0;

    if (currentFocusIndex === items.findIndex((i) => i.txt === item)) return 0;

    if (currentFocusIndex === 0) {
      if (isFirstItem && item === "moveDown") return 0;
    }

    return -1;
  };

  const ActionButton = ({
    action,
    icon,
    buttonIndex,
    onClick,
    disabled = false,
  }: {
    action: string;
    icon: JSX.Element;
    buttonIndex: string;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
  }) => {
    const Icon = React.cloneElement(icon, {
      className:
        "group-hover:group-enabled:fill-white-default group-disabled:fill-gray-500 group-focus:fill-white-default transition duration-100",
    });

    return (
      <Button
        theme="secondary"
        className={`${
          disabled ? "disabled" : ""
        } group border-none transition duration-100 h-0 !py-5 lg:!pb-3 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover disabled:!bg-transparent`}
        iconWrapperClassName="!w-7 !mr-0"
        icon={Icon}
        disabled={disabled}
        onClick={onClick}
        tabIndex={getTabIndex(action)}
        buttonRef={(el: HTMLButtonElement) => {
          const index = buttonIndex as unknown as number;
          if (el && itemsRef.current) {
            itemsRef.current[index] = el;
          }
        }}
      >
        <span className="text-sm mx-3 xl:mx-0">{t(action)}</span>
      </Button>
    );
  };

  return (
    <div className="relative">
      <div
        className={`bg-gray-200 px-6 lg:px-0 py-4 lg:py-0 flex flex-wrap sm:flex-col ${lang}`}
        role="toolbar"
        aria-label={t("elementActions")}
        onKeyDown={handleNav}
      >
        <ActionButton
          disabled={isFirstItem}
          action="moveUp"
          icon={<ChevronUp />}
          buttonIndex="button-0"
          onClick={() => moveUp(item.index)}
        />
        <ActionButton
          disabled={isLastItem}
          action="moveDown"
          icon={<ChevronDown />}
          buttonIndex="button-1"
          onClick={() => moveDown(item.index)}
        />
        <ActionButton
          action="duplicate"
          icon={<Duplicate />}
          buttonIndex="button-2"
          onClick={() => {
            setFocusInput(true);
            duplicateElement(item.index);
          }}
        />
        <ActionButton
          action="remove"
          icon={<Close />}
          buttonIndex="button-3"
          onClick={() => {
            // if index is 0, then highlight the form title
            const labelId = item.index === 0 ? "formTitle" : `item${item.index - 1}`;

            remove(item.id);
            document.getElementById(labelId)?.focus();
          }}
        />

        {!isRichText && (
          <Modal
            title={t("moreOptions")}
            openButton={
              <ActionButton
                action="more"
                icon={<ThreeDotsIcon />}
                buttonIndex="button-4"
                onClick={() => null}
              />
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
