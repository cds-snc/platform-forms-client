"use client";
import { useTranslation } from "@i18n/client";
import { ExampleWrapper } from "./ExampleWrapper";
import { Description, FormGroup } from "@root/components/clientComponents/forms";
import { StarRating as StarRatingComponent } from "@clientComponents/forms";

export const StarRating = () => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <h3 className="mb-0" data-testid="element-description-title">
        {t("addElementDialog.starRating.title")}
      </h3>
      <p data-testid="element-description-text">{t("addElementDialog.starRating.description")}</p>

      <ExampleWrapper>
        <FormGroup name="star-rating-example" ariaDescribedBy="star-rating-example-description">
          <legend data-testid="label" className="gcds-label" id="label-1">
            {t("addElementDialog.starRating.exampleQuestion")}
          </legend>
          <Description id="star-rating-example-description">
            {t("addElementDialog.starRating.exampleDescription")}
          </Description>
          <StarRatingComponent
            id={"star-rating-example-5"}
            name={"star-rating-example-5"}
            required={false}
            numberOfStars={5}
            sparkleOnSelect={false}
          />
        </FormGroup>
      </ExampleWrapper>
    </>
  );
};
