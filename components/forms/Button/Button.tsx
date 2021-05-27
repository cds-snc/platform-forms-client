import React from "react";
import classnames from "classnames";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  children: React.ReactNode;
  secondary?: boolean;
  base?: boolean;
  size?: "big";
  unstyled?: boolean;
  testid?: string;
}

export const Button = (
  props: ButtonProps & JSX.IntrinsicElements["button"]
): React.ReactElement => {
  const { type, children, secondary, base, onClick, className, testid } = props;

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
    >
      {children}
    </button>
  );
};

export default Button;
