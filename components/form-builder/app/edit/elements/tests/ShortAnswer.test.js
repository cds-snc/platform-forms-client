import React from "react";
import { cleanup } from "@testing-library/react";
import { ShortAnswer } from "../ShortAnswer";
import { withProviders, defaultStore as store } from "@formbuilder/test-utils";

describe("ShortAnswer", () => {
  afterEach(cleanup);
  it("renders with props and test content", async () => {
    let rendered = await withProviders(
      store,
      <ShortAnswer data-testid="short-answer">test content</ShortAnswer>
    );
    const renderedElement = rendered.getByTestId("short-answer");
    expect(renderedElement).toHaveClass("border-bottom-1");
    expect(rendered.container).toHaveTextContent("test content");
  });
});
