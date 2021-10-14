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

describe.each([["en"], ["fr"]])("Generate a form group", (lang) => {
  afterEach(cleanup);
  test("renders properly", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={radioButtonData} language={lang} />
      </Form>
    );
    const title =
        lang === "en" ? radioButtonData.properties.titleEn : radioButtonData.properties.titleFr,
      description =
        lang === "en"
          ? radioButtonData.properties.descriptionEn
          : radioButtonData.properties.descriptionFr;

    // There are as many title as there are.
    screen.getAllByText(title).forEach((input) => {
      expect(input).toBeInTheDocument();
    });
    // description properly renders
    screen.getAllByText(description).forEach((description) => {
      expect(description).toHaveClass("gc-description");
    });
    expect(screen.getByRole("group")).toHaveAccessibleDescription(description);
    // Children are rendered. Containts
    screen.getAllByText(title).forEach((child) => {
      expect(screen.getByRole("group")).toContainElement(child);
    });
    // Every child has a description
    screen.getAllByText(description).forEach((description) => {
      expect(screen.getByRole("group")).toContainElement(description);
    });
  });
});
