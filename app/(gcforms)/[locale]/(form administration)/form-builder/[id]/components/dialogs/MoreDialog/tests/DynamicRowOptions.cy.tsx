import React from "react";
import { DynamicRowOptions } from "../DynamicRowOptions";
import { FormElementTypes } from "@lib/types";

describe("<DynamicRowOptions />", () => {
  const item = {
    id: 1,
    type: FormElementTypes.dynamicRow,
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

    cy.mount(<DynamicRowOptions item={item} setItem={setItemSpy} />);
  });
});
