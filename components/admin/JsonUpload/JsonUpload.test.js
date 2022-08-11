import React from "react";
import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import mockedAxios from "axios";
import { JSONUpload } from "./JsonUpload";

jest.mock("axios");
// Mock out the useRefresh hook because without a rerender the component will be stuck in loading state
jest.mock("@lib/hooks/useRefresh", () => ({
  useRefresh: jest.fn(() => ({ refreshData: jest.fn(), isRefreshing: false })),
}));
describe("JSON Upload Component", () => {
  afterEach(cleanup);
  const formConfig = { test: "test JSON" };
  it("renders without errors", async () => {
    await act(async () => {
      render(<JSONUpload></JSONUpload>);
    });
    expect(screen.queryByTestId("jsonInput")).toBeInTheDocument();
    expect(screen.queryByTestId("submitStatus")).not.toBeInTheDocument();
  });
  it("renders existing form JSON if passed in", async () => {
    const form = {
      formConfig: formConfig,
    };
    await act(async () => {
      render(<JSONUpload form={form}></JSONUpload>);
    });
    expect(screen.queryByTestId("jsonInput").value).toBe(JSON.stringify(formConfig, null, 2));
  });
  it("Shows an error message if unparseable JSON is entered", async () => {
    const user = userEvent.setup();
    const form = {
      formConfig: undefined,
    };
    await act(async () => {
      render(<JSONUpload form={form}></JSONUpload>);
    });
    await act(async () => {
      await user.click(screen.queryByTestId("upload"));
    });
    expect(mockedAxios.mock.calls.length).toBe(0);
    expect(screen.queryByTestId("alert")).toBeInTheDocument();
  });
  it("Shows a submit status message if successfully submitted to API", async () => {
    const user = userEvent.setup();
    const form = {
      formConfig: formConfig,
    };
    mockedAxios.mockResolvedValue();
    await act(async () => {
      render(<JSONUpload form={form}></JSONUpload>);
    });
    await act(async () => {
      await user.click(screen.queryByTestId("upload"));
    });
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: "/api/templates" }));
    expect(screen.queryByTestId("submitStatus")).toBeInTheDocument();
  });
});
