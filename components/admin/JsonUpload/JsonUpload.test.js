import React from "react";
import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import mockedAxios from "axios";
import { JSONUpload } from "./JsonUpload";

jest.mock("axios");
// Mock out the useRefresh hook because without a rerender the component will be stuck in loading state
jest.mock("../../../lib/hooks/useRefresh", () => ({
  useRefresh: jest.fn(() => ({ refreshData: jest.fn(), isRefreshing: false })),
}));
describe("JSON Upload Component", () => {
  afterEach(cleanup);
  const formConfig = { test: "test JSON" };
  test("renders without errors", () => {
    render(<JSONUpload></JSONUpload>);
    expect(screen.queryByTestId("jsonInput")).toBeInTheDocument();
  });
  test("renders existing form JSON if passed in", () => {
    const form = {
      formConfig: formConfig,
    };
    render(<JSONUpload form={form}></JSONUpload>);
    expect(screen.queryByTestId("jsonInput").value).toBe(JSON.stringify(formConfig, null, 2));
  });
  test("It shows an error message if invalid json is entered", async () => {
    userEvent.setup();
    const form = {
      formConfig: undefined,
    };
    mockedAxios.mockResolvedValue({
      status: 200,
    });
    render(<JSONUpload form={form}></JSONUpload>);
    await act(async () => {
      await userEvent.click(screen.queryByTestId("upload"));
    });

    expect(screen.queryByTestId("alert")).toBeInTheDocument();
  });
  test("It shows a success message if valid json is entered", async () => {
    userEvent.setup();
    const form = {
      formConfig: formConfig,
    };
    mockedAxios.mockResolvedValue({
      status: 200,
    });

    render(<JSONUpload form={form}></JSONUpload>);
    await act(async () => {
      await userEvent.click(screen.queryByTestId("upload"));
    });

    expect(screen.queryByTestId("submitStatus")).toBeInTheDocument();
  });
});
