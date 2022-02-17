import React from "react";
import { cleanup, render, fireEvent, screen, act } from "@testing-library/react";

import mockedAxios from "axios";
import FormAccess from "./FormAccess";

jest.mock("axios");

describe("Form Access Component", () => {
  afterEach(cleanup);
  const formConfig = { formID: 1 };
  it("renders without errors", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: [{}],
    });
    await act(async () => {
      render(<FormAccess formID={formConfig.formID}></FormAccess>);
    });
    expect(screen.getByTestId("add-email")).toBeInTheDocument();
  });

  it("submits a new email address and display it in the list", async () => {
    const testEmailAddress = "test@cds-snc.ca";

    mockedAxios.mockResolvedValue({
      status: 200,
      data: [
        {
          id: 4,
          email: testEmailAddress,
          active: true,
        },
      ],
    });
    await act(async () => {
      render(<FormAccess formID={formConfig.formID}></FormAccess>);
    });
    const input = screen.getByLabelText("settings.formAccess.addEmailAriaLabel");
    await act(async () => {
      fireEvent.change(input, { target: { value: testEmailAddress } });
    });
    await act(async () => {
      mockedAxios.mockResolvedValue({
        status: 200,
        data: {
          success: {
            id: 1,
          },
        },
      });
      fireEvent.click(screen.getByTestId("add-email"));
    });
    expect(screen.findByText(testEmailAddress)).toBeInTheDocument;
  });
});
