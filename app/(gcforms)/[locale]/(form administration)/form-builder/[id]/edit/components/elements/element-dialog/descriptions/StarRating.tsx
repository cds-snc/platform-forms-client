"use client";

import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";

export const StarRating = () => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <h3 className="mb-0" data-testid="element-description-title">
        {t("addElementDialog.starRating.title")}
      </h3>
      <p data-testid="element-description-text">{t("addElementDialog.starRating.description")}</p>

      <ExampleWrapper>
        <div>
          <legend className="gcds-label" id="label-star-example">
            {t("addElementDialog.starRating.exampleQuestion")}
          </legend>
          <div className="mt-2 flex gap-1 text-4xl">
            <span className="text-yellow-400">★</span>
            <span className="text-yellow-400">★</span>
            <span className="text-yellow-400">★</span>
            <span className="text-gray-300">★</span>
            <span className="text-gray-300">★</span>
          </div>
        </div>
      </ExampleWrapper>
    </>
  );
};
