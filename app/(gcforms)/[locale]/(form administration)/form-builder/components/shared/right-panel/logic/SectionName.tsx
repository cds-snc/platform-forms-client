import { useTranslation } from "@i18n/client";
export const SectionName = ({ sectionName }: { sectionName: string | null }) => {
  const { t } = useTranslation("form-builder");
  return sectionName ? (
    <h3 className="mb-0 ml-2 block text-sm font-normal">
      {t("logic.sectionTitle")} <strong> {sectionName}</strong>
    </h3>
  ) : null;
};
