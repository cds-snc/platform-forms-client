import React from "react";
import classnames from "classnames";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  children: React.ReactNode;
  secondary?: boolean;
  base?: boolean;
  size?: "big";
  unstyled?: boolean;
  disabled?: boolean;
  testid?: string;
}

export const Button = (
  props: ButtonProps & JSX.IntrinsicElements["button"]
): React.ReactElement => {
  const { type, children, secondary, base, onClick, className, testid, disabled } = props;

  const classes = classnames(
    "gc-button",
    {
      "gc-button--secondary": secondary,
      "gc-button--base": base,
    },
    className
  );

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      data-testid={testid ? testid : "button"}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
