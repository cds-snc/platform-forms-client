import { serverTranslation } from "@i18n";
import Link from "next/link";
import { headers } from "next/headers";

const LanguageToggle = async () => {
  const {
    t,
    i18n: { language: currentLang },
  } = await serverTranslation("common");
  const pathname = (await headers()).get("x-path") ?? "";

  return (
    <Link
      href={pathname.replace(`/${currentLang}`, `/${currentLang === "en" ? "fr" : "en"}`)}
      className="text-right text-base"
      aria-label={`${t("lang-toggle")}: ${currentLang == "en" ? "Français" : "English"}`}
      lang={currentLang === "en" ? "fr" : "en"}
      prefetch={false}
    >
      {currentLang === "en" ? "Français" : "English"}
    </Link>
  );
};

export default LanguageToggle;
