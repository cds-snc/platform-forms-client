import React from "react";
import { cleanup, render } from "@testing-library/react";
import { Layout } from "../layout/Layout";

describe("Form Builder", () => {
  afterEach(cleanup);

  it("renders without errors", async () => {
    const { getByText } = render(<Layout />);
    const button = getByText("Add form element");
    expect(button).toBeTruthy();
  });
});
