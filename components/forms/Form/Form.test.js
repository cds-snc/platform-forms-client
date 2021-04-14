import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getRenderedForm } from "../../../lib/formBuilder";
import Form from "./Form";

const formMetadata = {
  id: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1, 2],
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
    {
      id: 2,
      type: "textField",
      properties: {
        titleEn: "What is your name?",
        titleFr: "Votre nom?",
        validation: {
          required: true,
          type: "text",
        },
      },
    },
  ],
};

describe("Generate a form component", () => {
  afterEach(cleanup);
  test("...with fake children", () => {
    render(
      <Form formMetadata={formMetadata} language="en" t={(key) => key}>
        <div data-testid="test-child"></div>
      </Form>
    );
    expect(screen.getByTestId("form"))
      .toBeInTheDocument()
      .toContainElement(screen.getByTestId("test-child"));
  });
  describe("Form Functionality", () => {
    afterAll(() => {
      cleanup;
    });

    test("Form is submitted", () => {
      const form = getRenderedForm(formMetadata, "en");
      render(
        <Form formMetadata={formMetadata} language="en" t={(key) => key}>
          {form}
        </Form>
      );
      const textField = screen.getByRole("textbox", {
        name: formMetadata.elements[1].properties.titleEn,
      });
      userEvent.type(textField, "Bryan");

      expect(textField).toHaveValue("Bryan");

      userEvent.click(screen.getByRole("button", { type: "submit" }));
      // Need to work on how we test the form was successfully submitted.
      // Maybe mock Formik and check is handleSubmit and validation resolved?
      // Could also check the setSubmitting(false) was called.
    });
  });
});
