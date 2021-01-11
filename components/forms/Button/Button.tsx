import React from "react";
import classnames from "classnames";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  children: React.ReactNode;
  secondary?: boolean;
  base?: boolean;
  size?: "big";
  unstyled?: boolean;
}

export const Button = (
  props: ButtonProps & JSX.IntrinsicElements["button"]
): React.ReactElement => {
  const {
    type,
    children,
    secondary,
    base,
    onClick,
    className,
    ...defaultProps
  } = props;

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
      data-testid="button"
      {...defaultProps}
    >
      {children}
    </button>
  );
};

export default Button;
