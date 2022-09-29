import React from "react";
import { cleanup, render } from "@testing-library/react";
import { Layout } from "../layout/Layout";

describe("Form Builder", () => {
  afterEach(cleanup);

  it("renders without errors", async () => {
    const { getByText } = render(<Layout />);
    const button = getByText("startH2"); // This is the name of the translations key
    expect(button).toBeTruthy();
  });
});
