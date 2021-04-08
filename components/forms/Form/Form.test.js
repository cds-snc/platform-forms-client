import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Form from "./Form";

const formMetadata = {
  id: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1],
  elements: [
    {
      id: 1,
      type: "richText",
      properties: {
        titleEn: "",
        titleFr: "",
        descriptionEn:
          "Thank you so much for your interest in the Canadian Digital Service’s Forms product. <br/><br/> Please provide your information below so CDS can contact you about improving, updating, or digitizing a form.",
        descriptionFr:
          "Merci beaucoup de l’intérêt que vous portez au produit de Formulaire du Service Numérique Canadien. <br/><br/> Veuillez fournir vos renseignements ci-dessous afin que le SNC puisse vous contacter pour discuter davantage l'amélioration, la mise à jour ou la numérisation d'un formulaire.",
        validation: {
          required: false,
        },
      },
    },
  ],
};

// Need more tests here like submit, validation, ect....

describe("Generate a form component", () => {
  afterEach(cleanup);
  test("...with fake children", () => {
    render(
      <Form formMetadata={formMetadata} language="en" t={(key) => key}>
        <div data-testid="test-child"></div>
      </Form>
    );
    screen.debug();
    expect(screen.getByTestId("form"))
      .toBeInTheDocument()
      .toContainElement(screen.getByTestId("test-child"));
    // Label properly renders
  });
});
