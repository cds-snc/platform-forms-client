import React from "react";
import classnames from "classnames";

interface ButtonProps {
  children: React.ReactNode;
  secondary?: boolean;
  base?: boolean;
  size?: "big";
  unstyled?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  testid?: string;
  ariaProps?: React.AriaAttributes;
  dataAttrName?: string;
  dataAttrValue?: string;
}

export const Button = (
  props: ButtonProps & JSX.IntrinsicElements["button"]
): React.ReactElement => {
  const { children, secondary, base, onClick, className, testid, destructive } = props;

  const classes = classnames(
    "gc-button",
    {
      "gc-button--secondary": secondary,
      "gc-button--base": base,
      "gc-button--destructive": destructive,
    },
    className
  );

  return (
    <button
      className={classes}
      onClick={onClick}
      data-testid={testid ? testid : "button"}
      {...props}
    >
      {children}
    </button>
  );
};
