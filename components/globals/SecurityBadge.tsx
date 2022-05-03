import * as React from "react";
import { useTranslation } from "next-i18next";
import { SecurityAttributeBadgeProps } from "@lib/types";

export function SecurityAttributeBadge(props: SecurityAttributeBadgeProps): JSX.Element {
  const { t } = useTranslation("common");
  const content = props.securityLevel.includes("Unclassified")
    ? t("securityAttributeBadge.desc")
    : t("securityAttributeBadge.protected-desc");

  return (
    <div className={props.className} aria-describedby={content}>
      <span className="gc-security-badge">{content}</span>
    </div>
  );
}
