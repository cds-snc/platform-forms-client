import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

jest.mock("formik", () => ({
  ...jest.requireActual("formik"),
  useField: jest.fn(() => [
    { field: { value: "" } },
    { meta: { touched: null, error: null } },
    { setValue: jest.fn() },
  ]),
}));

const textInputData = {
  id: "1",
  type: "textField",
  properties: {
    titleEn: "What is your full name?",
    titleFr: "Quel est votre nom complet?",
    placeholderEn: "I wish I knew",
    placeholderFr: "Je ne sais pas",
    descriptionEn: "This is a description",
    descriptionFr: "Voice une description",
    autoComplete: "name",
    validation: {
      required: true,
      maxLength: 40,
    },
  },
};

describe.each([["en"], ["fr"]])("Generate a text input", (lang) => {
  afterEach(cleanup);
  test("renders without errors", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textInputData} language={lang} t={(key) => key} />
      </Form>
    );
    const title =
        lang === "en" ? textInputData.properties.titleEn : textInputData.properties.titleFr,
      description =
        lang === "en"
          ? textInputData.properties.descriptionEn
          : textInputData.properties.descriptionFr,
      placeholder =
        lang === "en"
          ? textInputData.properties.placeholderEn
          : textInputData.properties.placeholderFr;

    // Label properly renders
    expect(screen.getByText(title)).toBeInTheDocument();
    // Description properly renders
    expect(screen.getByText(description)).toBeInTheDocument();
    // Field marked as required
    expect(screen.getByRole("textbox")).toBeRequired().toHaveAccessibleDescription(description);
    expect(screen.queryByTestId("required")).toBeInTheDocument();
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });
});

describe("Check attributes on rendered text input", () => {
  it("has the correct autoComplete value", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textInputData} language={"en"} t={(key) => key} />
      </Form>
    );
    expect(screen.getByRole("textbox").hasAttribute("autoComplete").valueOf("name"));
  });
});

describe("Verfify character count restrictions", () => {
  let screen;
  let t;
  beforeEach(() => {
    t = (key) => key;
    screen = render(
      <Form t={(key) => key}>
        <GenerateElement element={textInputData} language={"en"} t={(key) => key} />
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

  it("displays an error message indicating too many characters", () => {
    const textInput = screen.getByRole("textbox");
    userEvent.type(textInput, "This is 48 characters This is 48 characters This");
    screen.getByText(
      t("formElements.characterCount.part1-error") +
        " 8 " +
        t("formElements.characterCount.part2-error")
    );
  });
});
