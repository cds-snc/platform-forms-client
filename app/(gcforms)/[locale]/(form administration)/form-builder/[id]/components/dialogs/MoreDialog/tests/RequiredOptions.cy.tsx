import React from "react";
import { RequiredOptions } from "../RequiredOptions";
import { FormElementTypes } from "@lib/types";

describe("<AddRules />", () => {
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
      titleEn: "Short answer",
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
    cy.viewport(800, 80);

    const setItemSpy = cy.spy().as("setItem");

    cy.mount(<RequiredOptions item={item} setItem={setItemSpy} />);
  });

  it("sets Required to true", () => {
    cy.viewport(800, 80);

    const setItemSpy = cy.spy().as("setItem");

    cy.mount(<RequiredOptions item={item} setItem={setItemSpy} />);
    cy.get('[data-testid="required"]').click();
    cy.get("@setItem").should("have.been.calledWith", {
      ...item,
      properties: { ...item.properties, validation: { required: true } },
    });

    cy.get('[data-testid="required"]').click();
    cy.get("@setItem").should("have.been.calledWith", {
      ...item,
      properties: { ...item.properties, validation: { required: false } },
    });
  });
});
