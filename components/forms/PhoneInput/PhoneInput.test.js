import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

jest.mock("formik", () => ({
  ...jest.requireActual("formik"),
  useField: jest.fn(() => [
    { value: "" },
    { touched: null, error: null },
    { setValue: jest.fn(() => {}) },
  ]),
}));

const textInputData = {
  id: "1",
  type: "textField",
  properties: {
    titleEn: "Mobile phone number",
    titleFr: "Numero de teelphone mobile",
    validation: {
      type: "phone",
      required: true,
    },
  },
};

describe.each([["en"], ["fr"]])("Generate an input phone", (lang) => {
  afterEach(cleanup);
  test("renders without errors", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textInputData} language={lang} />
      </Form>
    );
    const title =
      lang === "en" ? textInputData.properties.titleEn : textInputData.properties.titleFr;

    // Label properly renders
    expect(screen.getByText(title)).toBeInTheDocument();
    // Field marked as required
    expect(screen.queryByTestId("asterisk")).toBeInTheDocument();
  });
});
