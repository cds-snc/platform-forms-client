import React from "react";
import { Button } from "../Button/Button";

interface ButtonProps {
  text: string;
  onClick: Function;
}
interface ModalProps {
  children: React.ReactNode;
  buttons?: Array<ButtonProps>;
}

export const Label = (props: ModalProps): React.ReactElement => {
  const { children, buttons } = props;

  const buttonList = buttons
    ? buttons.map(
        (button): React.ReactElement => {
          return (
            <Button key={buttons.indexOf(button)} onClick={button.onClick} type="button">
              {button.text}
            </Button>
          );
        }
      )
    : null;
  return (
    <div className="modal">
      {children}
      <div className="buttonList">{buttonList}</div>
    </div>
  );
};
