import React from "react";
import { cleanup, render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "./Form";
import { submitToAPI } from "@lib/integration/helpers";
import { useFlag } from "@lib/hooks/useFlag";

jest.mock("@lib/integration/helpers", () => {
  const originalModule = jest.requireActual("@lib/integration/helpers");
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(),
    submitToAPI: jest.fn(),
  };
});

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
      switch (flag) {
        case "formTimer":
          return true;
        case "reCaptcha":
          return false;
        case "submitToReliabilityQueue":
          return false;
        default:
          return useFlag(flag);
      }
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
  formConfig: {
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
            titleFr: "Quelle est votre adresse électronique?",
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
    act(() => {
      render(<Form formRecord={formRecord} language="en" t={(key) => key} />);
    });
    expect(await screen.findAllByRole("button", { type: "submit" })).toHaveLength(1);
  });

  it("Form can be submitted", async () => {
    userEvent.setup();
    act(() => {
      render(<Form formRecord={formRecord} language="en" t={(key) => key} />);
    });
    expect(screen.getByRole("button", { type: "submit" })).toBeInTheDocument();

    await act(async () => await userEvent.click(screen.getByRole("button", { type: "submit" })));

    await waitFor(() => expect(submitToAPI).toBeCalledTimes(1));
  });

  it("shows the alert after pressing submit if the timer hasn't expired", async () => {
    userEvent.setup();
    mockFormTimerState = {
      canSubmit: false,
      remainingTime: 5,
      timerDelay: 5,
      timeLock: 0,
    };
    act(() => {
      render(<Form formRecord={formRecord} language="en" t={(key) => key} />);
    });
    const submitButton = screen.getByRole("button", { type: "submit" });
    await waitFor(() => expect(submitButton).toBeInTheDocument());

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await act(async () => await userEvent.click(screen.getByRole("button", { type: "submit" })));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(submitToAPI).not.toBeCalled();
  });
});
