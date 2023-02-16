import React from "react";
import { render, cleanup } from "@testing-library/react";
import { LineInput } from "../LineInput";

describe("LineInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render and handle callback", async () => {
    const mockCallbackOnKeyUp = jest.fn((e) => e);
    const mockCallbackOnBlur = jest.fn((e) => e);
    const rendered = render(
      <LineInput
        onKeyUp={mockCallbackOnKeyUp}
        onBlur={mockCallbackOnBlur}
        inputLabelId={"testId"}
      />
    );
    expect(rendered.queryByTestId("value-input")).toBeInTheDocument();
    expect(rendered.queryByTestId("value-input")).toHaveAttribute("aria-labelledby", "testId");
  });
});
