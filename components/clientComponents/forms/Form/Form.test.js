import React from "react";
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Form } from "@clientComponents/forms";
import { useFlag } from "@lib/hooks/useFlag";
import { submitForm } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";

jest.mock("@lib/client/clientHelpers", () => {
  const originalModule = jest.requireActual("@lib/client/clientHelpers");
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(),
  };
});

jest.mock("app/(gcforms)/[locale]/(form filler)/id/[...props]/actions", () => ({
  __esModule: true,
  submitForm: jest.fn(),
}));

let mockFormTimerState = {
  canSubmit: true,
  remainingTime: 0,
  timerDelay: 0,
  timeLock: 0,
};

jest.mock("@lib/hooks", () => {
  const originalModule = jest.requireActual("@lib/hooks");
  return {
    __esModule: true,
    ...originalModule,
    useFlag: jest.fn((flag) => {
      return useFlag(flag);
    }),
    useFormTimer: jest.fn(() => [
      mockFormTimerState,
      {
        startTimer: jest.fn(),
        checkTimer: jest.fn(),
        disableTimer: jest.fn(),
      },
    ]),
  };
});

const formRecord = {
  form: {
    id: 1,
    version: 1,
    titleEn: "Test Form",
    titleFr: "Formulaire de test",
    layout: [1, 2],
    elements: [
      {
        id: 1,
        type: "textField",
        properties: {
          titleEn: "What is your full name?",
          titleFr: "Quel est votre nom complet?",
          validation: {
            required: false,
          },
          description: "",
          placeholderEn: "",
          placeholderFr: "",
        },
      },
      {
        id: 2,
        type: "textField",
        properties: {
          titleEn: "What is your email address?",
          titleFr: "Quelle est votre adresse courriel?",
          validation: {
            required: false,
          },
          description: "",
          placeholderEn: "",
          placeholderFr: "",
        },
      },
    ],
  },
};

describe("Generate a form component", () => {
  afterEach(cleanup);
  test("...with fake children", () => {
    render(
      <Form formRecord={formRecord} language="en" t={(key) => key}>
        <div data-testid="test-child" />
      </Form>
    );
    const renderedForm = screen.getByTestId("form");
    expect(renderedForm).toBeInTheDocument();
    expect(renderedForm).toContainElement(screen.getByTestId("test-child"));
  });
});

describe("Form Functionality", () => {
  afterAll(() => {
    cleanup();
  });

  it("there is 1 and only 1 submit button", async () => {
    render(<Form formRecord={formRecord} language="en" t={(key) => key} />);
    expect(await screen.findAllByRole("button", { type: "submit" })).toHaveLength(1);
  });

  it("Form can be submitted", async () => {
    mockFormTimerState = {
      canSubmit: true,
      remainingTime: 5,
      timerDelay: 5,
      timeLock: 0,
    };
    render(<Form formRecord={formRecord} language="en" t={(key) => key} />);
    const submitButton = screen.getByRole("button", { type: "submit" });
    await waitFor(() => expect(submitButton).toBeInTheDocument());

    // using `fireEvent` instead of `user.click` because it triggers a Formik update,
    // which then throws the warning:
    // "Warning: An update to Formik inside a test was not wrapped in act(...)."
    fireEvent.click(screen.getByRole("button", { type: "submit" }));

    await waitFor(() => expect(submitForm).toHaveBeenCalledTimes(1));
  });

  it("shows the alert after pressing submit if the timer hasn't expired", async () => {
    mockFormTimerState = {
      canSubmit: false,
      remainingTime: 5,
      timerDelay: 5,
      timeLock: 0,
    };

    render(<Form formRecord={formRecord} language="en" t={(key) => key} />);
    const submitButton = screen.getByRole("button", { type: "submit" });
    await waitFor(() => expect(submitButton).toBeInTheDocument());

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // using `fireEvent` instead of `user.click` because it triggers a Formik update,
    // which then throws the warning:
    // "Warning: An update to Formik inside a test was not wrapped in act(...)."
    fireEvent.click(screen.getByRole("button", { type: "submit" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    screen.debug();
    // expect(submitToAPI).not.toHaveBeenCalled();
  });
});
