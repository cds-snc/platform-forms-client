import React from "react";
import { AddressCompleteOptions } from "../AddressCompleteOptions";
import { FormElementTypes } from "@lib/types";

describe("<AddressCompleteOptions />", () => {
  const item = {
    id: 1,
    type: FormElementTypes.addressComplete,
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

    cy.mount(<AddressCompleteOptions item={item} setItem={setItemSpy} />);
  });
});
