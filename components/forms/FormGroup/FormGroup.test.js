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
    // Legend properly renders
    const title =
        lang === "en" ? radioButtonData.properties.titleEn : radioButtonData.properties.titleFr,
      description =
        lang === "en"
          ? radioButtonData.properties.descriptionEn
          : radioButtonData.properties.descriptionFr;

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(title)).toHaveClass("gc-label");
    // description properly renders
    expect(screen.getByText(description)).toBeInTheDocument().toHaveClass("gc-description");
    expect(screen.getByRole("group")).toHaveDescription(description);
    // Children render
    expect(screen.getByRole("group"))
      .toContainElement(screen.getByText(title))
      .toContainElement(screen.getByText(description));
  });
});
