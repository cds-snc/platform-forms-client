import React from "react";
import { cleanup } from "@testing-library/react";
import { ShortAnswer } from "../ShortAnswer";
import { withProviders, defaultStore as store } from "@lib/utils/form-builder/test-utils";

describe("ShortAnswer", () => {
  afterEach(cleanup);
  it("renders with props and test content", async () => {
    let rendered = await withProviders(
      store,
      <ShortAnswer data-testid="short-answer">test content</ShortAnswer>
    );
    const renderedElement = rendered.getByTestId("short-answer");
    expect(renderedElement).toHaveClass("border-b-1.5");
    expect(rendered.container).toHaveTextContent("test content");
  });
});
