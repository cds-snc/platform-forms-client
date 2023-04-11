import React from "react";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

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
  const form = {
    id: "test",
    form: formConfig,
    isPublished: false,
    deliveryOption: {
      emailAddress: "",
      emailSubjectEn: "",
      emailSubjectFr: "",
    },
    securityAttribute: "Unclassified",
  };
  it("renders without errors", async () => {
    render(<JSONUpload></JSONUpload>);
    expect(screen.queryByTestId("jsonInput")).toBeInTheDocument();
    expect(screen.queryByTestId("submitStatus")).not.toBeInTheDocument();
  });
  it("renders existing form JSON if passed in", async () => {
    render(<JSONUpload form={form}></JSONUpload>);
    expect(screen.queryByTestId("jsonInput").value).toBe(JSON.stringify(formConfig, null, 2));
  });
  it("Shows an error message if unparseable JSON is entered", async () => {
    const form = {};
    render(<JSONUpload form={form}></JSONUpload>);
    fireEvent.click(screen.queryByTestId("upload"));
    expect(mockedAxios.mock.calls.length).toBe(0);
    expect(await screen.findByTestId("alert")).toBeInTheDocument();
  });
  it("Shows a submit status message if successfully submitted to API", async () => {
    mockedAxios.mockResolvedValue();

    render(<JSONUpload form={form}></JSONUpload>);
    fireEvent.click(screen.queryByTestId("upload"));
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/templates/test", method: "PUT" })
    );
    expect(await screen.findByTestId("submitStatus")).toBeInTheDocument();
  });
});
