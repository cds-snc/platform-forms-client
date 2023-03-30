import React from "react";
import { CheckIcon, WarningIcon } from "@components/form-builder/icons";

export enum AttentionTypes {
  INFO = "info",
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
  classes?: string;
}

export const Attention = ({
  type = AttentionTypes.WARNING,
  heading,
  children,
  isAlert = true,
  isIcon = true,
  isSmall = false,
  classes = "",
}: AttentionProps & JSX.IntrinsicElements["div"]): React.ReactElement => {
  let headingTextColor = "";
  let backgroundColor = "";
  let icon = null;
  let ariaAttributes = {};

  switch (type) {
    case AttentionTypes.WARNING:
      ariaAttributes = { role: "alert" };
      headingTextColor = "text-black";
      backgroundColor = "bg-amber-100";
      icon = <WarningIcon title="Warning" className="w-14 h-14" />;
      break;
    case AttentionTypes.ERROR:
      ariaAttributes = { role: "alert" };
      headingTextColor = "validation-message";
      backgroundColor = "bg-[#f3e9e8]";
      icon = <WarningIcon title="Error" className="w-14 h-14 fill-[#ef4444]" />;
      break;
    case AttentionTypes.SUCCESS:
      ariaAttributes = { live: "polite" };
      headingTextColor = "text-green";
      backgroundColor = "bg-amber-100";
      icon = <CheckIcon className="w-10 h-10 fill-green-default" />;
      break;
    case AttentionTypes.INFO:
    //TODO future
  }

  return (
    <div
      {...(isAlert && ariaAttributes)}
      className={(isSmall ? "p-3" : "p-5") + ` flex ${backgroundColor} ${classes}`}
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
