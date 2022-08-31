import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

import { Button, FancyButton } from "./Button";
import { ChevronUp, ChevronDown, Close, Duplicate, ParagraphIcon } from "../icons";
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

const Label = styled.span`
  line-height: 38px;
  font-size: 16px;
  margin-right: 20px;
  margin-left: 4px;
`;

const UpDown = styled.div`
  display: flex;
  margin-left: 150px;
`;

const AddButtonWrapper = styled.div`
  position: absolute;
  top: 43px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
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
  const { remove, moveUp, moveDown, add, duplicateElement } = useTemplateStore();

  return (
    <Actions>
      <UpDown>
        <Button icon={<ChevronUp />} onClick={() => moveUp(item.index)}>
          <span className="sr-only">Move up</span>
        </Button>
        <Button icon={<ChevronDown />} onClick={() => moveDown(item.index)}>
          <span className="sr-only">Move down</span>
        </Button>
        <Label>Move</Label>
      </UpDown>

      <Button
        icon={<Duplicate />}
        onClick={() => {
          duplicateElement(item.index);
        }}
      >
        <Label>Duplicate</Label>
      </Button>

      <Button
        icon={<Close />}
        onClick={() => {
          remove(item.id);
        }}
      >
        <Label>Remove</Label>
      </Button>

      <Button icon={<ParagraphIcon />} onClick={() => null}>
        <Label>More</Label>
      </Button>

      <Modal
        title={`Modal ${item.index + 1}`}
        openButton={
          <Button icon={<ParagraphIcon />} onClick={() => null}>
            <Label>More</Label>
          </Button>
        }
        saveButton={renderSaveButton()}
      >
        {children}
      </Modal>

      <AddButtonWrapper>
        <FancyButton onClick={add}>Add element</FancyButton>
      </AddButtonWrapper>
    </Actions>
  );
};

PanelActions.propTypes = {
  item: PropTypes.object,
};
