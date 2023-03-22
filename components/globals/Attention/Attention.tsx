import React from "react";
import { CheckIcon, WarningIcon } from "@components/form-builder/icons";

//TODO update any components using this component e.g. support page

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
  isIcon?: boolean;
  isSmall?: boolean;
  width?: string;
}

export const Attention = ({
  type = AttentionTypes.WARNING,
  heading,
  children,
  isIcon = true,
  width = "50",
  isSmall = false,
}: AttentionProps & JSX.IntrinsicElements["div"]): React.ReactElement => {
  let headingTextColor = "";
  let backgroundColor = "";
  let icon = null;

  switch (type) {
    case AttentionTypes.WARNING:
      headingTextColor = "text-black";
      backgroundColor = "bg-amber-100";
      icon = <WarningIcon isFillInherit={true} title="Warning" width={width} />;
      break;
    case AttentionTypes.ERROR:
      headingTextColor = "validation-message";
      backgroundColor = "bg-[#f3e9e8]";
      icon = <WarningIcon isFillInherit={true} title="Error" width={width} />;
      break;
    case AttentionTypes.SUCCESS:
      headingTextColor = "text-green";
      backgroundColor = "bg-amber-100";
      icon = <CheckIcon isFillInherit={true} width={width} />;
      break;
    case AttentionTypes.INFO:
    //TODO
  }

  return (
    <div className={(isSmall ? "p-3" : "p-5") + ` flex ${backgroundColor}`}>
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
