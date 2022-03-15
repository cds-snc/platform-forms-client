import React from "react";
import { cleanup, render, screen, act } from "@testing-library/react";
import Form from "./Form";
import mockedDataLayer from "@lib/integration/helpers";

jest.mock("@lib/integration/helpers", () => ({
  submitToAPI: jest.fn(() => {}),
}));

jest.useFakeTimers();

jest.mock("@lib/hooks/useFlag", () => ({
  useFlag: jest.fn((flag) => {
    switch (flag) {
      case "formTimer":
        return true;
      case "reCaptcha":
        return false;
    }
  }),
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
});

describe("Form Functionality", () => {
  let mockedSubmitFunction;
  beforeEach(async () => {
    mockedSubmitFunction = jest.spyOn(mockedDataLayer, "submitToAPI");
    await act(async () => {
      render(<Form formConfig={formConfig} language="en" t={(key) => key}></Form>);
    });
  });
  afterEach(() => {
    mockedSubmitFunction.mockRestore();
  });
  afterAll(() => {
    cleanup();
  });

  it("there is 1 and only 1 submit button", async () => {
    expect(await screen.findAllByRole("button", { type: "submit" })).toHaveLength(1);
  });

  it("Form is submitted", async () => {
    const submitButton = screen.getByRole("button", { type: "submit" });

    await act(async () => {
      // complete the timeout to allow the form to be submitted
      jest.runAllTimers();
      submitButton.click();
    });
    expect(mockedSubmitFunction).toBeCalledTimes(1);
  });

  it("shows the alert after pressing submit if the timer hasn't expired", async () => {
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const submitButton = screen.getByRole("button", { type: "submit" });
    submitButton.click();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
