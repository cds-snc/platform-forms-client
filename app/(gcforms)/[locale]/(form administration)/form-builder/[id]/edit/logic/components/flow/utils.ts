/**
 * This code is based on an example from the React Flow Pro.
 * Source: https://pro.reactflow.dev/examples/react/auto-layout
 * Oss plan - https://www.xyflow.com/open-source
 */

import { Language } from "@lib/types/form-builder-types";
import { Position } from "reactflow";
import { Direction } from "./algorithms";

export function getSourceHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Bottom;
    case "BT":
      return Position.Top;
    case "LR":
      return Position.Right;
    case "RL":
      return Position.Left;
  }
}

export function getTargetHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Top;
    case "BT":
      return Position.Bottom;
    case "LR":
      return Position.Left;
    case "RL":
      return Position.Right;
  }
}

export const getStartLabels = () => {
  return {
    en: "Beginning",
    fr: "Début",
  };
};

export const getEndLabels = () => {
  return {
    en: "End",
    fr: "Fin",
  };
};

export const getReviewLabels = () => {
  return {
    en: "Review",
    fr: "Révision",
  };
};

// i18n
export const getStartElements = (lang: Language = "en") => {
  return [
    {
      data: lang === "en" ? "Introduction" : "Introduction",
      index: "introduction",
    },
    {
      data: lang === "en" ? "Privacy" : "Confidentialité",
      index: "privacy",
    },
  ];
};

// i18n
export const getEndNode = (lang: Language = "en") => {
  return {
    id: "end",
    data: {
      label: lang === "en" ? "End" : "Fin",
      children: [
        {
          data: lang === "en" ? "Confirmation message" : "Message de confirmation",
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
  return {
    id: "review",
    data: {
      label: lang === "en" ? "Review" : "Révision",
      children: [
        {
          data: lang === "en" ? "Review" : "Révision",
          index: "review",
        },
      ],
    },
    type: "groupNode",
    position: { x: 0, y: 0 },
  };
};
