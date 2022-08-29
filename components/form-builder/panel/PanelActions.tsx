import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { Button } from "./Button";
import { ChevronUp, ChevronDown, Close } from "../icons";
import { ElementType } from "../types";
import useTemplateStore from "../store/useTemplateStore";

const Actions = styled.div`
  display: flex;
`;

const Mover = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  margin: 5px;
  display: flex;
`;

const UpDown = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PanelActions = ({ item }: { item: ElementType }) => {
  const { remove, moveUp, moveDown } = useTemplateStore();
  return (
    <Actions>
      <Mover>
        <UpDown>
          <Button icon={<ChevronUp />} onClick={() => moveUp(item.index!)} />
          <Button icon={<ChevronDown />} onClick={() => moveDown(item.index!)} />
        </UpDown>
        <Button
          icon={<Close />}
          onClick={() => {
            remove(item.id);
          }}
        ></Button>
      </Mover>
    </Actions>
  );
};

PanelActions.propTypes = {
  item: PropTypes.object,
};
