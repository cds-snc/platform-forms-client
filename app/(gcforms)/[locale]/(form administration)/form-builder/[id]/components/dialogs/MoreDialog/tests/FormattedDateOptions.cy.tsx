import React from "react";
import { FormattedDateOptions } from "../FormattedDateOptions";
import { FormElementTypes } from "@lib/types";

describe("<FormattedDateOptions />", () => {
  const item = {
    id: 1,
    type: FormElementTypes.formattedDate,
    properties: {
      subElements: [],
      choices: [
        {
          en: "",
          fr: "",
        },
      ],
      titleEn: "",
      titleFr: "",
      validation: {
        required: false,
      },
      descriptionEn: "",
      descriptionFr: "",
      placeholderEn: "",
      placeholderFr: "",
    },
    index: 0,
    questionNumber: 0,
  };

  it("mounts", () => {
    cy.viewport(800, 400);

    const setItemSpy = cy.spy().as("setItem");

    cy.mount(<FormattedDateOptions item={item} setItem={setItemSpy} />);
  });
});
