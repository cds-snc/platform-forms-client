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

describe("Generate a radio button", () => {
  afterEach(cleanup);
  test("...in English", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={radioButtonData} language="en" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByText(radioButtonData.properties.titleEn)).toBeInTheDocument();
    expect(screen.getByText(radioButtonData.properties.titleEn)).toHaveClass("gc-label");
    // Choices properly render
    expect(screen.getByText(radioButtonData.properties.choices[0].en)).toBeInTheDocument();
    expect(screen.getByText(radioButtonData.properties.choices[1].en)).toBeInTheDocument();
    // Field is required
    screen.getAllByRole("radio").forEach((input) => {
      expect(input).toBeRequired();
    });
    // Proper linked description to element
    expect(screen.getByRole("group")).toHaveDescription(radioButtonData.properties.descriptionEn);
  });
  test("...in French", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={radioButtonData} language="fr" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByText(radioButtonData.properties.titleFr)).toBeInTheDocument();
    expect(screen.getByText(radioButtonData.properties.titleFr)).toHaveClass("gc-label");
    // Choices properly render
    expect(screen.getByText(radioButtonData.properties.choices[0].fr)).toBeInTheDocument();
    expect(screen.getByText(radioButtonData.properties.choices[1].fr)).toBeInTheDocument();
    // Field is required
    screen.getAllByRole("radio").forEach((input) => {
      expect(input).toBeRequired();
    });
    // Proper linked description to element
    expect(screen.getByRole("group")).toHaveDescription(radioButtonData.properties.descriptionFr);
  });
});
