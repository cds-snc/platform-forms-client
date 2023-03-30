import React from "react";
import { useTranslation } from "next-i18next";
import { WarningIcon } from "@components/form-builder/icons";

interface AttentionProps {
  type?: "warning" | "error"; //TODO: | "info"
  heading?: React.ReactNode;
  children: React.ReactNode;
}

export const Attention = ({
  type = "warning",
  heading,
  children,
}: AttentionProps & JSX.IntrinsicElements["div"]): React.ReactElement => {
  const { t } = useTranslation("common");

  let color = "";
  let icon = null;

  switch (type) {
    case "warning":
      color = "bg-amber-100";
      icon = <WarningIcon title={t("attention.warning")} width="50" />;
      break;
    case "error":
      color = "bg-red-100";
      icon = <WarningIcon title={t("attention.error")} width="50" />;
      break;
    // TODO case "info":
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
