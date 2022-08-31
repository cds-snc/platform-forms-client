import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

import { Button } from "./Button";
import { ChevronUp, ChevronDown, Close, Duplicate } from "../icons";
import { ElementTypeWithIndex } from "../types";
import useTemplateStore from "../store/useTemplateStore";

const Actions = styled.div`
  position: relative;
  margin-top: 5px;
  display: flex;
  background-color: #ebebeb;
  padding-left: 20px;
  height: 38px;
  align-items: center;
`;

const Label = styled.div`
  line-height: 38px;
  font-size: 16px;
  margin-right: 20px;
`;

const UpDown = styled.div`
  display: flex;
  margin-left: 150px;
`;

const AddButtonWrapper = styled.div`
  position: absolute;
  top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AddElement = styled.button`
  background-color: #fff;
  padding: 5px 20px;
  border: 1px solid #000;
  border-radius: 5px;
  font-size: 14px;
  &:hover {
    background: #ebebeb;
  }
`;

export const PanelActions = ({ item }: { item: ElementTypeWithIndex }) => {
  const { remove, moveUp, moveDown, add, duplicateElement } = useTemplateStore();
  return (
    <Actions>
      <UpDown>
        <Button icon={<ChevronUp />} onClick={() => moveUp(item.index)} />
        <Button icon={<ChevronDown />} onClick={() => moveDown(item.index)} />
        <Label>Move</Label>
      </UpDown>

      <Button
        icon={<Duplicate />}
        onClick={() => {
          duplicateElement(item.index);
        }}
      ></Button>
      <Label>Duplicate</Label>

      <Button
        icon={<Close />}
        onClick={() => {
          remove(item.id);
        }}
      ></Button>
      <Label>Remove</Label>

      <AddButtonWrapper>
        <AddElement onClick={add}>Add element</AddElement>
      </AddButtonWrapper>
    </Actions>
  );
};

PanelActions.propTypes = {
  item: PropTypes.object,
};
