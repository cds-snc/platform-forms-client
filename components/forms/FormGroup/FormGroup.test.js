import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

const radioButtonData = {
  id: 1,
  type: "radio",
  properties: {
    titleEn: "Spoken",
    titleFr: "Parlée",
    descriptionEn: "English Description",
    descriptionFr: "Description en Francais",
    validation: {
      required: false,
    },
    choices: [
      {
        en: "English",
        fr: "Anglais",
      },
      {
        en: "French",
        fr: "Français",
      },
    ],
  },
};

describe("Generate a form group", () => {
  afterEach(cleanup);
  test("...in English", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={radioButtonData} language="en" />
      </Form>
    );
    // Legend properly renders
    expect(screen.getByText(radioButtonData.properties.titleEn)).toBeInTheDocument();
    expect(screen.getByText(radioButtonData.properties.titleEn)).toHaveClass("gc-label");
    // description properly renders
    expect(screen.getByText(radioButtonData.properties.descriptionEn))
      .toBeInTheDocument()
      .toHaveClass("gc-description");
    expect(screen.getByRole("group")).toHaveDescription(radioButtonData.properties.descriptionEn);
    // Children render
    expect(screen.getByRole("group"))
      .toContainElement(screen.getByText(radioButtonData.properties.titleEn))
      .toContainElement(screen.getByText(radioButtonData.properties.descriptionEn));
  });
  test("...in French", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={radioButtonData} language="fr" />
      </Form>
    );
    // Legend properly renders
    expect(screen.getByText(radioButtonData.properties.titleFr)).toBeInTheDocument();
    expect(screen.getByText(radioButtonData.properties.titleFr)).toHaveClass("gc-label");
    // description properly renders
    expect(screen.getByText(radioButtonData.properties.descriptionFr))
      .toBeInTheDocument()
      .toHaveClass("gc-description");
    expect(screen.getByRole("group")).toHaveDescription(radioButtonData.properties.descriptionFr);
    // Children render
    expect(screen.getByRole("group"))
      .toContainElement(screen.getByText(radioButtonData.properties.titleFr))
      .toContainElement(screen.getByText(radioButtonData.properties.descriptionFr));
  });
});
