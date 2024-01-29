import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import DefaultLayout from "./DefaultLayout";

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
    };
  },
}));

describe("Generate the Base structure of a page", () => {
  afterEach(cleanup);

  test("FIP should be displayed", () => {
    render(<DefaultLayout />);

    expect(screen.queryByTestId("fip")).toBeInTheDocument();
  });
});
