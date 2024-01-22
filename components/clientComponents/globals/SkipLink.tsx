import { useTranslation } from "@i18n/client";
import Link from "next/link";
export const SkipLink = () => {
  const { t } = useTranslation("common");

  return (
    <div id="skip-link-container">
      <Link href="#content" id="skip-link" prefetch={false}>
        {t("skip-link")}
      </Link>
    </div>
  );
};
