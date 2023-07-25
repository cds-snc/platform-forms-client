import React from "react";
import { CheckIcon, WarningIcon } from "@components/form-builder/icons";

export enum AttentionTypes {
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success",
}

interface AttentionProps {
  type?: AttentionTypes;
  heading?: React.ReactNode;
  children: React.ReactNode;
  isAlert?: boolean;
  isIcon?: boolean;
  isSmall?: boolean;
  isLeftBorder?: boolean;
  classes?: string;
}

export const Attention = ({
  type = AttentionTypes.WARNING,
  heading,
  children,
  isAlert = true,
  isIcon = true,
  isSmall = false,
  isLeftBorder = false,
  classes = "",
}: AttentionProps & JSX.IntrinsicElements["div"]): React.ReactElement => {
  let headingTextColor = "";
  let backgroundColor = "";
  let icon = null;
  let ariaAttributes = {};
  let leftBorderColor = "";

  switch (type) {
    case AttentionTypes.WARNING:
      ariaAttributes = { role: "alert" };
      headingTextColor = "text-black";
      backgroundColor = "bg-amber-100";
      icon = <WarningIcon title="Warning" className="w-12 h-12 fill-black" />;
      if (isLeftBorder) {
        leftBorderColor = "border-orange";
      }
      break;
    case AttentionTypes.ERROR:
      ariaAttributes = { role: "alert" };
      headingTextColor = "validation-message";
      backgroundColor = "bg-red-50";
      icon = <WarningIcon title="Error" className="w-12 h-12 fill-[#ef4444]" />;
      // TODO: should be border-l-red-500 but border-l fails, also border-red-500 fails - probably a tailwind config issue
      if (isLeftBorder) {
        leftBorderColor = "border-red";
      }
      break;
    case AttentionTypes.SUCCESS:
      ariaAttributes = { live: "polite" };
      headingTextColor = "text-green";
      backgroundColor = "bg-amber-100";
      icon = <CheckIcon className="w-12 h-12 fill-green-default" />;
      if (isLeftBorder) {
        leftBorderColor = "border-green";
      }
      break;
  }

  return (
    <div
      {...(isAlert && ariaAttributes)}
      className={`${isSmall ? "p-3" : "p-5"} flex ${backgroundColor} ${
        isLeftBorder ? "border-l-4 " + leftBorderColor : ""
      } ${classes}`}
    >
      {isIcon && (
        <div className="flex">
          <div className={`pr-4 self-start ${headingTextColor}`}>{icon}</div>
        </div>
      )}
      <div>
        {heading && (
          <p className={(isSmall ? "text-sm" : "text-[1.3rem]") + ` font-bold ${headingTextColor}`}>
            {heading}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};
