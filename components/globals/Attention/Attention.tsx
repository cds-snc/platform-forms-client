import React from "react";
import { WarningIcon } from "@components/form-builder/icons";

interface AttentionProps {
  type?: "warning"; //TODO: | "info" | "error"
  heading?: React.ReactNode;
  children: React.ReactNode;
}

export const Attention = ({
  type = "warning",
  heading,
  children,
}: AttentionProps & JSX.IntrinsicElements["div"]): React.ReactElement => {
  let color = "";
  let icon = null;

  switch (type) {
    case "warning":
      color = "bg-amber-100";
      icon = <WarningIcon title="Warning" width="50" />;
      break;
    // TODO case "info":
    // TODO case "error":
  }

  return (
    <div className={`inline-flex pt-5 pr-7 pb-5 pl-5 ${color}`}>
      <div className="flex">
        <div className="pr-7">{icon}</div>
      </div>
      <div>
        {heading && <p className="text-[1.3rem] font-bold">{heading}</p>}
        {children}
      </div>
    </div>
  );
};
