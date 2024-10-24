import React from "react";
import { CharacterLimitOptions } from "../CharacterLimitOptions";
import { FormElementTypes } from "@lib/types";

describe("<CharacterLimitOptions />", () => {
  const item = {
    id: 1,
    type: FormElementTypes.textField,
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

    cy.mount(<CharacterLimitOptions item={item} setItem={setItemSpy} />);
  });
});
