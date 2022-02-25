import React from "react";
import { cleanup, render, screen, act } from "@testing-library/react";
import Form from "./Form";
import mockedDataLayer from "../../../lib/integration/helpers";

jest.mock("../../../lib/integration/helpers", () => ({
  submitToAPI: jest.fn(() => {}),
}));

jest.useFakeTimers();

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
    let mockedSubmitFunction;
    beforeEach(() => {
      mockedSubmitFunction = jest.spyOn(mockedDataLayer, "submitToAPI");
    });
    afterEach(() => {
      mockedSubmitFunction.mockRestore();
    });
    afterAll(() => {
      cleanup();
    });

    it("Form is submitted", async () => {
      await act(async () => {
        render(<Form formConfig={formConfig} language="en" t={(key) => key}></Form>);
      });

      const submitButton = screen.getByRole("button", { type: "submit" });

      await act(async () => {
        // complete the timeout to allow the form to be submitted
        jest.runAllTimers();
        submitButton.click();
      });
      expect(submitButton).not.toBeDisabled();
      expect(mockedSubmitFunction).toBeCalledTimes(1);
    });

    it("Form is not submitted because not enough time has passed", async () => {
      await act(async () => {
        render(<Form formConfig={formConfig} language="en" t={(key) => key}></Form>);
      });

      const submitButton = screen.getByRole("button", { type: "submit" });
      await act(async () => {
        submitButton.click();
      });
      expect(submitButton).toBeDisabled();
      expect(mockedSubmitFunction).not.toHaveBeenCalled();
    });
  });
});
