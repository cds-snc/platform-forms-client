import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import { Button, FancyButton } from "./Button";
import { ChevronUp, ChevronDown, Close, Duplicate, ThreeDotsIcon } from "../icons";
import { ElementTypeWithIndex } from "../types";
import useTemplateStore from "../store/useTemplateStore";

import { Modal } from "./Modal";

const Actions = styled.div`
  position: relative;
  margin-top: 5px;
  display: flex;
  background-color: #ebebeb;
  padding-left: 20px;
  height: 62px;
  align-items: center;
`;

const PanelButton = styled(Button)`
  border: 1px solid transparent;
  padding: 20px 5px;
  transition: background 0.1s ease, border 0.1s linear;

  &.disabled {
    color: #ccc;
    cursor: not-allowed;

    svg {
      fill: #ccc;
    }

    &:hover,
    &:focus,
    &:active {
      color: #ccc;
      background-color: #eee;

      svg {
        fill: #ccc;
      }
    }
  }
`;

const Label = styled.span`
  line-height: 38px;
  font-size: 16px;
  margin-right: 3px;
  margin-left: 3px;
`;

const UpDown = styled.div`
  display: flex;
  margin-right: 10px;

  svg {
    margin-right: 0;
  }

  button:first-of-type {
    padding-left: 0;
  }

  button:last-of-type {
    padding-left: 0;
  }
`;

const AddButtonWrapper = styled.div`
  position: absolute;
  top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  right: 20px;

  button {
    font-size: 16px;
  }
`;

export const PanelActions = ({
  item,
  renderSaveButton,
  children,
}: {
  item: ElementTypeWithIndex;
  renderSaveButton: () => React.ReactElement | string | undefined;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation("form-builder");
  const { remove, moveUp, moveDown, add, duplicateElement, form } = useTemplateStore();
  const isLastItem = item.index === form.elements.length - 1;
  const isFirstItem = item.index === 0;

  return (
    <Actions className="panel-actions">
      <UpDown>
        <PanelButton
          className={isFirstItem ? "disabled" : ""}
          icon={<ChevronUp />}
          onClick={isFirstItem ? undefined : () => moveUp(item.index)}
        >
          <Label>{t("Move up")}</Label>
        </PanelButton>
        <PanelButton
          className={isLastItem ? "disabled" : ""}
          icon={<ChevronDown />}
          onClick={isLastItem ? undefined : () => moveDown(item.index)}
        >
          <Label>{t("Move down")}</Label>
        </PanelButton>
      </UpDown>

      <PanelButton
        icon={<Duplicate />}
        onClick={() => {
          duplicateElement(item.index);
        }}
      >
        <Label>{t("Duplicate")}</Label>
      </PanelButton>

      <PanelButton
        icon={<Close />}
        onClick={() => {
          remove(item.id);
        }}
      >
        <Label>{t("Remove")}</Label>
      </PanelButton>

      <Modal
        title="More options"
        openButton={
          <PanelButton icon={<ThreeDotsIcon />} onClick={() => null}>
            <Label>{t("More")}</Label>
          </PanelButton>
        }
        saveButton={renderSaveButton()}
      >
        {children}
      </Modal>

      <AddButtonWrapper>
        <FancyButton
          onClick={() => {
            add(item.index);
          }}
        >
          {t("Add element")}
        </FancyButton>
      </AddButtonWrapper>
    </Actions>
  );
};

PanelActions.propTypes = {
  item: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  renderSaveButton: PropTypes.func,
};
