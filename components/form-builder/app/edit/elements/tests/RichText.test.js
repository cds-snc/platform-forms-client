import React from "react";
import { cleanup } from "@testing-library/react";
import { RichText } from "../RichText";
import { withProviders, defaultStore as store } from "@formbuilder/test-utils";

describe("RichText", () => {
  afterEach(cleanup);
  it("renders rich text editor", async () => {
    let rendered = await withProviders(store, <RichText parentIndex={0} />);
    const editor = rendered.getByTestId("richText");
    expect(editor.innerHTML).toContain("description 1 en");
  });
});
