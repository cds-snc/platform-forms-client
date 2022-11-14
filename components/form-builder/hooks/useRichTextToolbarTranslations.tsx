import { useTranslation } from "next-i18next";

export const useRichTextToolbarTranslations = () => {
  const { t } = useTranslation("form-builder");

  return {
    textFormatting: t("textFormatting"),
    bold: t("formatBold"),
    italic: t("formatItalic"),
    heading2: t("formatH2"),
    heading3: t("formatH3"),
    bulletList: t("formatBulletList"),
    numberList: t("formatNumberedList"),
    link: t("insertLink"),
  };
};
