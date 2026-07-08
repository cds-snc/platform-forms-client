"use client";
import { useTranslation } from "@root/i18n";
import { cn } from "@root/lib/utils";
import { ReactNode } from "react";

export const Nav = ({
  isFormBuilder,
  children,
}: {
  isFormBuilder: boolean;
  children: ReactNode;
}) => {
  const { t } = useTranslation("common");
  return (
    <nav aria-label={t("footer.ariaLabel")} className={cn(!isFormBuilder && "inline-block")}>
      {children}
    </nav>
  );
};
