import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import { Button } from "../shared/Button";
import { ChevronUp, ChevronDown, Close, Duplicate, ThreeDotsIcon } from "../icons";
import { Modal } from "./Modal";
import { FormElementWithIndex } from "../types";
import { useTemplateStore } from "../store/useTemplateStore";

const Actions = styled.div`
  position: relative;
  display: flex;
  background-color: #ebebeb;
  align-items: center;
  padding: 10px;

  @media (max-width: 1130px) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const Label = styled.span`
  font-size: 16px;
  margin-right: 3px;
  margin-left: 3px;
`;

const AddButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    font-size: 16px;
  }
`;

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

  return (
    <Actions className={`panel-actions ${lang}`}>
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
      >
        <Label>{t("moveUp")}</Label>
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
      >
        <Label>{t("moveDown")}</Label>
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
      >
        <Label>{t("duplicate")}</Label>
      </Button>

      <Button
        theme="secondary"
        className="group border-none transition duration-100 h-0 !py-5 !pl-4 !pr-2 m-1 !bg-transparent hover:!bg-gray-600 focus:!bg-blue-hover"
        iconWrapperClassName="!w-7 !mr-0"
        icon={
          <Close className="group-hover:fill-white-default group-focus:fill-white-default transition duration-100" />
        }
        onClick={() => {
          remove(item.id);
        }}
      >
        <Label>{t("remove")}</Label>
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
            >
              <Label>{t("more")}</Label>
            </Button>
          }
          saveButton={renderSaveButton()}
        >
          {children}
        </Modal>
      )}

      <AddButtonWrapper className="add-element">
        <Button
          onClick={() => {
            setFocusInput(true);
            add(item.index);
          }}
          theme="secondary"
          className="!border-1.5 !py-2 !px-4 leading-6"
        >
          {t("addElement")}
        </Button>
      </AddButtonWrapper>
    </Actions>
  );
};

PanelActions.propTypes = {
  item: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.any]),
  renderSaveButton: PropTypes.func,
};
