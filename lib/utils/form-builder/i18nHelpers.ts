import { type Language } from "@lib/types/form-builder-types";

import { customTranslate } from "@lib/i18nHelpers";

export const getStartLabels = () => {
  const { t } = customTranslate("common");
  return {
    en: t("logic.start", { lng: "en" }),
    fr: t("logic.start", { lng: "fr" }),
  };
};

export const getEndLabels = () => {
  const { t } = customTranslate("common");
  return {
    en: t("logic.end", { lng: "en" }),
    fr: t("logic.end", { lng: "fr" }),
  };
};

export const getReviewLabels = () => {
  const { t } = customTranslate("common");
  return {
    en: t("logic.review", { lng: "en" }),
    fr: t("logic.review", { lng: "fr" }),
  };
};

// i18n
export const getStartElements = (lang: Language = "en") => {
  const { t } = customTranslate("common");
  return [
    {
      type: "lockedElement",
      id: "introduction",
      data: {
        label: t("logic.introduction", { lng: lang }),
        children: [],
      },
      position: { x: 0, y: 0 },
    },
    {
      type: "lockedElement",
      id: "privacy",
      data: {
        label: t("logic.privacy", { lng: lang }),
        children: [],
      },
      position: { x: 0, y: 0 },
    },
  ];
};

// i18n
export const getEndNode = (lang: Language = "en") => {
  const { t } = customTranslate("common");
  return {
    type: "endNode",
    id: "end",
    data: {
      label: lang === "en" ? "End" : "Fin",
      children: [
        {
          type: "lockedElement",
          id: "confirmation",
          data: {
            label: t("logic.confirmation", { lng: lang }),
            children: [],
          },
          position: { x: 0, y: 0 },
        },
      ],
    },
    position: { x: 0, y: 0 },
  };
};

// i18n
export const getReviewNode = (lang: Language = "en") => {
  const { t } = customTranslate("common");
  return {
    type: "groupNode",
    id: "review",
    data: {
      label: t("logic.review", { lng: lang }),
      children: [
        {
          type: "lockedElement",
          id: "review",
          data: {
            label: t("logic.review", { lng: lang }),
            children: [],
          },
          position: { x: 0, y: 0 },
        },
      ],
    },
    position: { x: 0, y: 0 },
  };
};
