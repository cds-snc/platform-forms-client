import { useTranslation } from "@i18n/client";
import { Language } from "@lib/types/form-builder-types";

export const SectionName = ({
  sectionName,
  lang,
  hasReview,
}: {
  sectionName: string | null;
  lang: Language;
  hasReview?: boolean;
}) => {
  const { t } = useTranslation(["common", "form-builder"]);

  if (sectionName === "Start") {
    sectionName = t("logic.start", { lang });
  }

  // Set a more descriptive name for the end node
  // & Switch between end node and end node with review label
  if (sectionName === "End" || sectionName === "Review") {
    const endLabel = t("logic.endNode.label", { lang, ns: "form-builder" });
    const endWithReviewLabel = t("logic.endNodeWithReview.label", { lang, ns: "form-builder" });
    sectionName = !hasReview ? endLabel : endWithReviewLabel;
  }

  return sectionName ? (
    <h3 className="mb-0 ml-2 block text-sm font-normal">
      {t("logic.pageTitle", { ns: "form-builder" })} <strong> {sectionName}</strong>
    </h3>
  ) : null;
};
