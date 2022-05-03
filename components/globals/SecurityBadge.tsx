import React from "react";
import { useTranslation } from "next-i18next";
import { SecurityAttributeBadgeProps } from "@lib/types";

const SecurityAttributeBadge = (props: SecurityAttributeBadgeProps) => {
  const { t } = useTranslation("common");
  const content = props.securityLevel.includes("Protected")
    ? t("securityAttributeBadge.protected-desc")
    : t("securityAttributeBadge.desc");

  return (
    <div className={props.className} aria-describedby={content}>
      <span className="gc-security-badge">{content}</span>
    </div>
  );
};

export default SecurityAttributeBadge;
