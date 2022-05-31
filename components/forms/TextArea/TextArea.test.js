import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const textAreaData2 = {
  id: 2,
  type: "textArea",
  properties: {
    titleEn: "What is the problem you are facing",
    titleFr: "Quel est le problème auquel vous êtes confronté?",
    placeholderEn: "Something difficult",
    placeholderFr: "Quelque chose difficile",
    descriptionEn: "",
    descriptionFr: "",
    charLimit: 100,
    validation: {
      required: true,
      maxLength: 40,
    },
  },
};

describe("Generate a text area", () => {
  afterEach(cleanup);
  it.each([["en"], ["fr"]])("renders without errors", (lang) => {
    render(<GenerateElement element={textAreaData} language={lang} t={(key) => key} />);
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
    const renderedTextBox = screen.getByRole("textbox");
    expect(renderedTextBox).toBeRequired();
    expect(renderedTextBox).toHaveAccessibleDescription(description);
    expect(screen.queryByTestId("required")).toBeInTheDocument();
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });
});

describe("Verfify character count restrictions", () => {
  let screen;
  beforeEach(() => {
    screen = render(<GenerateElement element={textAreaData} language={"en"} t={(key) => key} />);
  });

  it("does not display any message when not enough characters have been typed in", async () => {
    userEvent.setup();
    const textInput = screen.getByRole("textbox");
    await userEvent.type(textInput, "This is 21 characters");

    expect(screen.queryByText("characters left.")).not.toBeInTheDocument();
  });

  it("displays a message with the number of characters remaining", async () => {
    userEvent.setup();
    const textInput = screen.getByRole("textbox");
    await userEvent.type(textInput, "This is 35 characters This is 35 ch");
    expect(
      screen.getByText(
        "formElements.characterCount.part1" + " 5 " + "formElements.characterCount.part2"
      )
    ).toBeInTheDocument();
  });

  it("displays a message indicating too many characters", async () => {
    userEvent.setup();
    const textInput = screen.getByRole("textbox");
    await userEvent.type(textInput, "This is 48 characters This is 48 characters This");
    screen.getByText(
      "formElements.characterCount.part1-error" + " 8 " + "formElements.characterCount.part2-error"
    );
  });
});

describe("Accessibility tests for the textarea component.", () => {
  let screen;

  beforeEach(() => {
    screen = render(<GenerateElement element={textAreaData2} language={"en"} t={(key) => key} />);
  });
  it("checks the `aria-describedby` attribute", () => {
    // initial attribute has no value since the description is empty.
    const textBox = screen.getByRole("textbox");
    expect(textBox).toBeRequired();
    expect(textBox).not.toHaveAccessibleDescription();
  });

  it("after typing some characters, the attribute is updated to indicate how many characters are left.", async () => {
    userEvent.setup();
    const textInput = screen.getByRole("textbox");
    await userEvent.type(textInput, "This is 35 characters This is 35 ch");
    const textbox = screen.getByRole("textbox");
    expect(textbox).toBeRequired();

    expect(textbox).toHaveAccessibleDescription(
      "formElements.characterCount.part1" + " 5 " + "formElements.characterCount.part2"
    );
  });

  it("after typing more characters than the maxLength, the attribute is updated to indicate how many characters are too many.", async () => {
    userEvent.setup();
    const textInput = screen.getByRole("textbox");
    await userEvent.type(textInput, "This is 48 characters This is 48 characters This");
    const textbox = screen.getByRole("textbox");
    expect(textbox).toBeRequired();

    expect(textbox).toHaveAccessibleDescription(
      "formElements.characterCount.part1-error" + " 8 " + "formElements.characterCount.part2-error"
    );
  });
});
