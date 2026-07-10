"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

const DEFAULT_NUMBER_OF_STARS = 5;
const MIN_STARS = 2; // Two because one would make it impossible uncheck a star
const MAX_STARS = 10;

interface StarRatingSelectorProps {
  item: FormElementWithIndex;
}

export const StarRatingSelector = ({ item }: StarRatingSelectorProps) => {
  const { t } = useTranslation("form-builder");
  const { updateField, numberOfStars } = useTemplateStore((s) => ({
    updateField: s.updateField,
    numberOfStars:
      s.form.elements[item.index]?.properties?.numberOfStars ?? DEFAULT_NUMBER_OF_STARS,
  }));

  const options = Array.from({ length: MAX_STARS - MIN_STARS + 1 }, (_, i) => MIN_STARS + i);

  return (
    <div className="mt-4">
      <label className="mb-2 block text-sm font-semibold" htmlFor={`star-count-${item.id}`}>
        {t("addElementDialog.starRating.numberOfStars")}
      </label>
      <select
        id={`star-count-${item.id}`}
        className="gc-dropdown rounded border border-gray-400 px-3 py-2 text-sm"
        value={numberOfStars}
        onChange={(e) => {
          updateField(
            `form.elements[${item.index}].properties.numberOfStars`,
            Number(e.target.value)
          );
        }}
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
};
