import React from "react";
import { TextFieldOptions } from "../TextFieldOptions";
import { FormElementTypes } from "@lib/types";

describe("<TextFieldOptions />", () => {
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

    cy.mount(<TextFieldOptions item={item} setItem={setItemSpy} />);
  });
});
