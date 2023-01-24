import React from "react";
import { render, cleanup } from "@testing-library/react";
import { ListBox } from "../ListBox";

describe("ListBox", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render", async () => {
    const mockCallback = jest.fn((e) => e);
    const options = [
      {
        id: "1",
        value: "One",
      },
      {
        id: "2",
        value: "Two",
      },
    ];

    const rendered = render(<ListBox options={options} handleChange={mockCallback} />);
    rendered.debug();
  });
});
