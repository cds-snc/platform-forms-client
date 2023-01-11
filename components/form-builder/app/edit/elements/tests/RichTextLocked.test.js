import React from "react";
import { cleanup } from "@testing-library/react";
import { RichTextLocked } from "../RichTextLocked";
import { withProviders, defaultStore as store } from "@formbuilder/test-utils";

describe("RichTextLocked", () => {
  afterEach(cleanup);
  it("renders rich text editor in a locked panel", async () => {
    let rendered = await withProviders(store, <RichTextLocked />);
    // const editor = rendered.getByRole("textbox");
    // expect(editor.innerHTML).toContain("Rich text locked");

    const locked = rendered.getByTestId("locked-item");
    expect(locked).toBeInTheDocument();
  });
});
