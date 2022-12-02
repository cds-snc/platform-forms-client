import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

import { useTemplateStore } from "../store";
import { LockIcon } from "../icons";
import { Button } from "../shared";

const Actions = styled.div`
  position: relative;
  display: flex;
  background-color: #ebebeb;
  padding-left: 20px;
  height: 62px;
  align-items: center;
`;

const Label = styled.span`
  display: flex;
  align-items: center;
  line-height: 38px;
  font-size: 16px;
  margin-right: 3px;
  margin-left: 3px;

  & svg {
    display: inline-block;
    margin-right: 15px;
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

export const PanelActionsLocked = ({ addElement }: { addElement: boolean }) => {
  const { add, setFocusInput } = useTemplateStore((s) => ({
    add: s.add,
    setFocusInput: s.setFocusInput,
  }));
  const { t } = useTranslation("form-builder");
  return (
    <Actions className="last-of-type:rounded-b-md">
      <Label>
        <LockIcon /> {t("lockedElement")}
      </Label>
      {addElement && (
        <AddButtonWrapper>
          <Button
            onClick={() => {
              // ensure element gets added to start of elements array
              // add function is add(index + 1)
              setFocusInput(true);
              add(-1);
            }}
            theme="secondary"
            className="!border-1.5 !py-2 !px-4 leading-6"
          >
            {t("addElement")}
          </Button>
        </AddButtonWrapper>
      )}
    </Actions>
  );
};
