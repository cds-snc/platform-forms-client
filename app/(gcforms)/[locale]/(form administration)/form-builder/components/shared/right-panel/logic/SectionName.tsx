import { useTranslation } from "@i18n/client";
import { Language } from "@lib/types/form-builder-types";

export const SectionName = ({
  sectionName,
  lang,
}: {
  sectionName: string | null;
  lang: Language;
}) => {
  const { t } = useTranslation(["common", "form-builder"]);

  if (sectionName === "Start") {
    sectionName = t("logic.start", { lang });
  }

  return sectionName ? (
    <h3 className="mb-0 ml-2 block text-sm font-normal">
      {t("logic.sectionTitle", { ns: "form-builder" })} <strong> {sectionName}</strong>
    </h3>
  ) : null;
};
