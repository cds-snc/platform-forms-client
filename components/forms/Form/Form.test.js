import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "./Form";
import mockedDataLayer from "../../../lib/integration/helpers";

jest.mock("../../../lib/integration/helpers", () => ({
  submitToAPI: jest.fn(() => {}),
}));

const formConfig = {
  id: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1, 2],
  elements: [],
};

describe("Generate a form component", () => {
  afterEach(cleanup);
  test("...with fake children", () => {
    render(
      <Form formConfig={formConfig} language="en" t={(key) => key}>
        <div data-testid="test-child"></div>
      </Form>
    );
    expect(screen.getByTestId("form"))
      .toBeInTheDocument()
      .toContainElement(screen.getByTestId("test-child"));
  });
  describe("Form Functionality", () => {
    afterAll(() => {
      cleanup;
    });

    test("Form is submitted", () => {
      render(<Form formConfig={formConfig} language="en" t={(key) => key}></Form>);

      userEvent.click(screen.getByRole("button", { type: "submit" }));
      const mockedSubmitFunction = jest.spyOn(mockedDataLayer, "submitToAPI");
      waitFor(() => {
        expect(mockedSubmitFunction).toBeCalledTimes(1);
      });
    });
  });
});
