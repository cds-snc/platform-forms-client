import React from "react";
import { Description } from "../Description";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { FormElementTypes } from "@lib/types";

describe("<Description />", () => {
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
    cy.viewport(800, 80);

    const setItemSpy = cy.spy().as("setItem");

    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <Description item={item} setItem={setItemSpy} />
      </TemplateStoreProvider>
    );
  });
});
