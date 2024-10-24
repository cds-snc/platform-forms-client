import React from "react";
import { Question } from "../Question";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";

describe("<Question />", () => {
  const item = {
    id: 1,
    type: "textField",
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
        <Question item={item} setItem={setItemSpy} />
      </TemplateStoreProvider>
    );
  });

  it("changes the question text", () => {
    cy.viewport(800, 130);

    const setItemSpy = cy.spy().as("setItemSpy");

    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <Question item={item} setItem={setItemSpy} />
      </TemplateStoreProvider>
    );

    cy.get("input").should("be.visible").type("New question");
    cy.get("@setItemSpy").should("have.been.called");

    // @TODO: since setItem is called onChange, we can't check the final value.
    // This raises an interesting question- should setItem be called onChange (ie on every keypress)?
    // Also, for some reason seems like the .type() above is not actually changing the value of the input.

    // cy.get("@setItemSpy").should("have.been.calledWith", {
    //   ...item,
    //   properties: { ...item.properties, titleEn: "New question" },
    // });
  });
});
