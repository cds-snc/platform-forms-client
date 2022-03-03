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
      required: true,
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

describe.each([["en"], ["fr"]])("Generate a radio button", (lang) => {
  afterEach(cleanup);
  test("renders without errors", () => {
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
    // Label and description properly render
    screen.getAllByText(title).forEach((radio) => {
      expect(radio).toBeInTheDocument();
    });
    // Choices properly render
    expect(screen.getByText(radioButtonData.properties.choices[0][lang])).toBeInTheDocument();
    expect(screen.getByText(radioButtonData.properties.choices[1][lang])).toBeInTheDocument();
    // Field is required
    expect(screen.queryByTestId("required")).toBeInTheDocument();
    screen.getAllByRole("radio").forEach((input) => {
      expect(input).toBeRequired();
    });
    // Proper linked description to element
    expect(screen.getByRole("group")).toHaveAccessibleDescription(description);
  });
  test("not required displays properly", () => {
    radioButtonData.properties.validation.required = false;
    render(
      <Form t={(key) => key}>
        <GenerateElement element={radioButtonData} language={lang} />
      </Form>
    );
    expect(screen.queryByTestId("required")).not.toBeInTheDocument();
    screen.getAllByRole("radio").forEach((input) => {
      expect(input).not.toBeRequired();
    });
    radioButtonData.properties.validation.required = true;
  });
});
