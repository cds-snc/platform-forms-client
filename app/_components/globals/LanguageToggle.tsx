import React, { Suspense } from "react";
import { useTranslation } from "@i18n/client";
import { StyledLink } from "./StyledLink/StyledLink";
import { usePathname } from "next/navigation";

const LanguageToggle = () => {
  const { t, i18n } = useTranslation("common");
  const href = usePathname();
  const locale = i18n.language;

  return (
    <Suspense fallback={null}>
      <StyledLink
        href={href ?? ""}
        className="text-base text-right"
        ariaLabel={`${t("lang-toggle")}: ${locale == "en" ? "Français" : "English"}`}
        lang={locale === "en" ? "fr" : "en"}
      >
        {locale === "en" ? "Français" : "English"}
      </StyledLink>
    </Suspense>
  );
};

export default LanguageToggle;
