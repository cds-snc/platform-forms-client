import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import { Button } from "../shared/Button";
import { Button as OldButton } from "./Button";
import { ChevronUp, ChevronDown, Close, Duplicate, ThreeDotsIcon } from "../icons";
import { Modal } from "./Modal";
import { ElementTypeWithIndex } from "../types";
import useTemplateStore from "../store/useTemplateStore";

const Actions = styled.div`
  position: relative;
  display: flex;
  background-color: #ebebeb;
  padding-left: 20px;
  height: 62px;
  align-items: center;
`;

const PanelButton = styled(OldButton)`
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
      background-color: transparent;

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
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation("form-builder");
  const {
    remove,
    moveUp,
    moveDown,
    add,
    duplicateElement,
    form: { elements },
    setFocusInput,
  } = useTemplateStore();
  const isLastItem = item.index === elements.length - 1;
  const isFirstItem = item.index === 0;
  const isRichText = item.type == "richText";

  return (
    <Actions className="panel-actions">
      <UpDown>
        <PanelButton
          className={isFirstItem ? "disabled" : ""}
          icon={<ChevronUp />}
          disabled={isFirstItem}
          onClick={() => moveUp(item.index)}
        >
          <Label>{t("Move up")}</Label>
        </PanelButton>
        <PanelButton
          className={isLastItem ? "disabled" : ""}
          icon={<ChevronDown />}
          disabled={isLastItem}
          onClick={() => moveDown(item.index)}
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
      {!isRichText && (
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
      )}

      <AddButtonWrapper>
        <Button
          onClick={() => {
            setFocusInput(true);
            add(item.index);
          }}
          theme="secondary"
          className="!border-1.5 !py-2 !px-4 leading-6"
        >
          {t("Add element")}
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
