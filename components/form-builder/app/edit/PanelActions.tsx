import React, { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";

import { FormElementTypes } from "@lib/types";
import { Button } from "../shared";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { Modal } from "./Modal";
import { FormElementWithIndex } from "@components/form-builder/types";
import { useTemplateStore } from "@components/form-builder/store";
import { usePanelActions } from "@components/form-builder/hooks/usePanelActions";

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

  const {
    buttonClasses,
    iconClasses,
    setRef,
    currentFocusIndex,
    isFirstItem,
    isLastItem,
    isRichText,
    itemsRef,
    getTabIndex,
    handleNav,
  } = usePanelActions(item, elements);

  const isInit = useRef(false);

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

  return (
    <div className="relative">
      <div
        className={`bg-gray-200 px-6 lg:px-0 py-4 lg:py-0 flex flex-wrap sm:flex-col ${lang}`}
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
          buttonRef={setRef("button-0")}
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
          buttonRef={setRef("button-1")}
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
          buttonRef={setRef("button-2")}
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
          buttonRef={setRef("button-3")}
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
                buttonRef={setRef("button-4")}
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
      <div className="absolute right-0 bottom-0 -mb-5 mr-8 xl:mr-2">
        <AddElementButton position={item.index} handleAdd={handleAddElement} />
      </div>
    </div>
  );
};
