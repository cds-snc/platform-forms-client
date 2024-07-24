import { Language } from "../../types/form-builder-types";

import { customTranslate } from "@lib/i18nHelpers";

export const getStartLabels = () => {
  const { t } = customTranslate("common");
  return {
    en: t("logic.start", { lng: "en" }),
    fr: t("logic.start", { lng: "fr" }),
  };
};

export const getEndLabels = () => {
  const { t } = customTranslate("my-forms");
  return {
    en: t("logic.end", { lng: "en" }),
    fr: t("logic.end", { lng: "fr" }),
  };
};

export const getReviewLabels = () => {
  const { t } = customTranslate("my-forms");
  return {
    en: t("logic.review", { lng: "en" }),
    fr: t("logic.review", { lng: "fr" }),
  };
};

// i18n
export const getStartElements = (lang: Language = "en") => {
  const { t } = customTranslate("my-forms");
  return [
    {
      data: t("logic.introduction", { lng: lang }),
      index: "introduction",
    },
    {
      data: t("logic.privacy", { lng: lang }),
      index: "privacy",
    },
  ];
};

// i18n
export const getEndNode = (lang: Language = "en") => {
  const { t } = customTranslate("my-forms");
  return {
    id: "end",
    data: {
      label: lang === "en" ? "End" : "Fin",
      children: [
        {
          data: t("logic.confirmation", { lng: lang }),
          index: "confirmation",
        },
      ],
    },
    type: "groupNode",
    position: { x: 0, y: 0 },
  };
};

// i18n
export const getReviewNode = (lang: Language = "en") => {
  const { t } = customTranslate("my-forms");
  return {
    id: "review",
    data: {
      label: t("logic.review", { lng: lang }),
      children: [
        {
          data: t("logic.review", { lng: lang }),
          index: "review",
        },
      ],
    },
    type: "groupNode",
    position: { x: 0, y: 0 },
  };
};
