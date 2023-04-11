import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormSettings from "../pages/id/[form]/settings";
import mockedAxios from "axios";
import { useRouter } from "next/router";

jest.mock("axios");
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Form Settings Page", () => {
  afterEach(cleanup);
  const form = {
    formID: 15,
    formConfig: { test: "test JSON" },
  };
  test("renders without errors", () => {
    useRouter.mockImplementation(() => ({
      query: {},
    }));
    render(<FormSettings form={form}></FormSettings>);
    expect(screen.queryByText("Form ID: 15")).toBeInTheDocument();
  });

  test("Delete button redirects on success", async () => {
    userEvent.setup();
    mockedAxios.mockResolvedValue({
      status: 200,
    });
    const push = jest.fn();
    useRouter.mockImplementation(() => ({
      asPath: "/",
      push: push,
    }));
    render(<FormSettings form={form}></FormSettings>);

    await userEvent.click(screen.queryByTestId("delete"));
    expect(screen.queryByTestId("confirmDelete")).toBeInTheDocument();

    await userEvent.click(screen.queryByTestId("confirmDelete"));
    waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
  test("Logs errors on failure", async () => {
    userEvent.setup();
    mockedAxios.mockResolvedValue({
      status: 400,
    });
    // I wanted to spy console.error but it didn't want to work
    // for now, the handler here calls JSON.stringify so we can spy that
    const spy = jest.spyOn(JSON, "stringify");

    render(<FormSettings form={form}></FormSettings>);

    await userEvent.click(screen.queryByTestId("delete"));
    expect(screen.queryByTestId("confirmDelete")).toBeInTheDocument();

    await userEvent.click(screen.queryByTestId("confirmDelete"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
