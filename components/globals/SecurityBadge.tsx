import React from "react";
import { useTranslation } from "next-i18next";
import { SecurityAttributeBadgeProps } from "@lib/types";

const SecurityAttributeBadge = (props: SecurityAttributeBadgeProps) => {
  const { t } = useTranslation("common");
  const content = props.securityLevel.toLowerCase().includes("protected")
    ? props.securityLevel + t("securityAttributeBadge.protected-desc")
    : t("securityAttributeBadge.desc");
  return (
    <div className={props.className}>
      <span
        data-testid="security-badge"
        className="gc-security-badge"
        aria-describedby="security-attribute-desc"
      >
        {content}
      </span>
      <p id="security-attribute-desc" hidden={true}>
        {content}
      </p>
    </div>
  );
};

export default SecurityAttributeBadge;
