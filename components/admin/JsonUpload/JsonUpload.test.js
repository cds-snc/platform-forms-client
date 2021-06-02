import React from "react";
import { cleanup, render, screen } from "@testing-library/react";

import { JSONUpload } from "./JsonUpload";

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
});
