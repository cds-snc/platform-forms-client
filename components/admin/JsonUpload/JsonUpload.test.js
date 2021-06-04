import React from "react";
import { cleanup, render, fireEvent, screen, act } from "@testing-library/react";
import mockedAxios from "axios";
import { JSONUpload } from "./JsonUpload";

jest.mock("axios");
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
    const form = {
      formConfig: undefined,
    };
    mockedAxios.mockResolvedValue({
      status: 200,
    });
    render(<JSONUpload form={form}></JSONUpload>);
    await act(async () => {
      await fireEvent.click(screen.queryByTestId("upload"));
    });
    expect(screen.queryByTestId("alert")).toBeInTheDocument();
  });
  test("It shows a success message if valid json is entered", async () => {
    const form = {
      formConfig: formConfig,
    };
    mockedAxios.mockResolvedValue({
      status: 200,
    });
    render(<JSONUpload form={form}></JSONUpload>);
    await act(async () => {
      await fireEvent.click(screen.queryByTestId("upload"));
    });
    expect(screen.queryByTestId("submitStatus")).toBeInTheDocument();
  });
});
