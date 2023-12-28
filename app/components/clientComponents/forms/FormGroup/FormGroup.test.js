import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { GenerateElement } from "@lib/formBuilder";
import { Formik } from "formik";

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
      <Formik onSubmit={() => {}}>
        <GenerateElement element={radioButtonData} language={lang} t={(key) => key} />
      </Formik>
    );
    const title =
        lang === "en" ? radioButtonData.properties.titleEn : radioButtonData.properties.titleFr,
      description =
        lang === "en"
          ? radioButtonData.properties.descriptionEn
          : radioButtonData.properties.descriptionFr;

    // Title are rendered
    screen.getAllByText(title).forEach((input) => {
      expect(input).toBeInTheDocument();
    });
    // description properly renders
    screen.getAllByText(description).forEach((description) => {
      expect(description).toHaveClass("gc-description");
    });
    expect(screen.getByRole("group")).toHaveAccessibleDescription(description);
    // Children are rendered.
    screen.getAllByText(title).forEach((child) => {
      expect(screen.getByRole("group")).toContainElement(child);
    });
    // Every child has a description
    screen.getAllByText(description).forEach((description) => {
      expect(screen.getByRole("group")).toContainElement(description);
    });
  });
});
