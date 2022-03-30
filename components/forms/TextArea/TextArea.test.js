import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../Form/Form";
import { GenerateElement } from "@lib/formBuilder";

jest.mock("formik", () => ({
  ...jest.requireActual("formik"),
  useField: jest.fn(() => [
    { field: { value: "" } },
    { meta: { touched: null, error: null } },
    { setValue: jest.fn() },
  ]),
}));

const textAreaData = {
  id: 2,
  type: "textArea",
  properties: {
    titleEn: "What is the problem you are facing",
    titleFr: "Quel est le problème auquel vous êtes confronté?",
    placeholderEn: "Something difficult",
    placeholderFr: "Quelque chose difficile",
    descriptionEn: "Here be a description",
    descriptionFr: "Pour décrire, ou pas décire..",
    validation: {
      required: true,
      maxLength: 40,
    },
  },
};

describe("Generate a text area", () => {
  afterEach(cleanup);
  test.each([["en"], ["fr"]])("renders without errors", (lang) => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textAreaData} language={lang} t={(key) => key} />
      </Form>
    );
    const title = lang === "en" ? textAreaData.properties.titleEn : textAreaData.properties.titleFr,
      description =
        lang === "en"
          ? textAreaData.properties.descriptionEn
          : textAreaData.properties.descriptionFr,
      placeholder =
        lang === "en"
          ? textAreaData.properties.placeholderEn
          : textAreaData.properties.placeholderFr;

    // Label properly renders
    expect(screen.getByTestId("label")).toContainHTML(title);
    // Description properly render
    expect(screen.getByText(description)).toBeInTheDocument();
    // Field marked as required and have aria described by
    expect(screen.getByRole("textbox")).toBeRequired().toHaveAccessibleDescription(description);
    expect(screen.queryByTestId("required")).toBeInTheDocument();
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });
});

describe("Verfify character count restrictions", () => {
  let screen;
  let t;
  beforeEach(() => {
    t = (key) => key;
    screen = render(
      <Form t={(key) => key}>
        <GenerateElement element={textAreaData} language={"en"} t={(key) => key} />
      </Form>
    );
  });

  it("does not display any message when not enough characters have been typed in", () => {
    const textInput = screen.getByRole("textbox");
    userEvent.type(textInput, "This is 21 characters");
    expect(screen.queryByText("characters left.")).not.toBeInTheDocument();
  });

  it("displays a message with the number of characters remaining", () => {
    const textInput = screen.getByRole("textbox");
    userEvent.type(textInput, "This is 35 characters This is 35 ch");
    expect(
      screen.getByText(
        t("formElements.characterCount.part1") + " 5 " + t("formElements.characterCount.part2")
      )
    ).toBeInTheDocument();
  });

  it("displays a message indicating too many characters", () => {
    const textInput = screen.getByRole("textbox");
    userEvent.type(textInput, "This is 48 characters This is 48 characters This");
    screen.getByText(
      t("formElements.characterCount.part1-error") +
        " 8 " +
        t("formElements.characterCount.part2-error")
    );
  });
});
