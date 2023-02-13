import React from "react";
import { useTranslation } from "next-i18next";
import { FormElementWithIndex } from "@formbuilder/types";
import { FormProperties } from "@lib/types";

export const QuestionNumber = ({
  elements,
  item,
  elIndex,
}: {
  item: FormElementWithIndex;
  elements: FormProperties["elements"];
  elIndex?: number;
}) => {
  const itemIndex = item.index;
  const isRichText = item.type === "richText";
  const { t } = useTranslation("form-builder");

  const questionNumber =
    elements.filter(() => !isRichText).findIndex((object) => object.id === item.id) + 1;

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  return (
    <>
      <span
        className={`absolute left-0 bg-gray-default py-2.5 rounded-r -ml-7 ${
          itemIndex < 9 ? "px-1.5" : "pl-0.5 pr-1 tracking-tighter"
        }`}
      >
        {elIndex === -1 && questionNumber}
        {elIndex !== -1 && alphabet[itemIndex]}
      </span>
      <label
        className="mb-1 sr-only block font-[700] absolute w-px h-px p-0 -m-px overflow-hidden whitespace-no-wrap border-0"
        style={{ clip: "rect(0, 0, 0, 0)" }}
        htmlFor={`item${itemIndex}`}
      >
        {t("question")} {itemIndex + 1}
      </label>
    </>
  );
};
