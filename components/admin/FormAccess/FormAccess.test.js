import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import mockedAxios from "axios";
import FormAccess from "./FormAccess";

jest.mock("axios");

describe("Form Access Component", () => {
  const formConfig = { id: "test0form00000id000asdf11" };

  afterEach(cleanup);

  it("renders without errors", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: [
        {
          id: 4,
          email: "test1@cds-snc.ca",
          active: true,
        },
      ],
    });

    render(<FormAccess formID={formConfig.id}></FormAccess>);
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: `/api/id/${formConfig.id}/owners`, method: "GET" })
    );
    expect(await screen.findByTestId("add-email")).toBeInTheDocument();
  });

  it("submits a new email address and display it in the list", async () => {
    const user = userEvent.setup();
    const testEmailAddress = "test@cds-snc.ca";
    mockedAxios.mockResolvedValue({
      status: 200,
      data: [
        {
          id: 4,
          email: "test1@cds-snc.ca",
          active: true,
        },
      ],
    });

    render(<FormAccess formID={formConfig.id}></FormAccess>);

    const input = await screen.findByLabelText("settings.formAccess.addEmailAriaLabel");

    await user.type(input, testEmailAddress);

    mockedAxios.mockResolvedValueOnce({
      status: 200,
      data: {
        success: {
          id: 1,
        },
      },
    });

    await user.click(screen.getByTestId("add-email"));
    expect(mockedAxios.mock.calls.length).toBe(2);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/id/test0form00000id000asdf11/owners", method: "POST" })
    );

    expect(await screen.findByText(testEmailAddress)).toBeInTheDocument;
  });

  it("submits a new email address for a form that does not exist, and receives an error from the API", async () => {
    const user = userEvent.setup();
    const testEmailAddress = "test@cds-snc.ca";
    mockedAxios
      .mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: 4,
            email: "test1@cds-snc.ca",
            active: true,
          },
        ],
      })
      .mockRejectedValueOnce({
        status: 404,
        data: { error: "The formID does not exist" },
      });

    render(<FormAccess formID={formConfig.id}></FormAccess>);

    const input = await screen.findByLabelText("settings.formAccess.addEmailAriaLabel");
    await user.type(input, testEmailAddress);

    await user.click(screen.getByTestId("add-email"));

    expect(await screen.findByTestId("alert")).toBeInTheDocument;
  });

  it("submits a new email address that is not a Government of Canada email, and receives an error from the API", async () => {
    const user = userEvent.setup();
    const testEmailAddress = "test@test.ca";

    mockedAxios
      .mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: 4,
            email: "test1@cds-snc.ca",
            active: true,
          },
        ],
      })
      .mockRejectedValueOnce({
        status: 400,
        data: { error: "The email is not a valid GC email" },
      });

    render(<FormAccess formID={formConfig.id}></FormAccess>);

    const input = await screen.findByLabelText("settings.formAccess.addEmailAriaLabel");
    await user.type(input, testEmailAddress);
    await user.click(screen.getByTestId("add-email"));

    expect(await screen.findByRole("alert")).toBeInTheDocument;
  });
});
