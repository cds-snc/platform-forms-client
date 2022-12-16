import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichText } from "../RichText";
import { withProviders, defaultStore as store } from "@formbuilder/test-utils";

describe("RichText", () => {
  afterEach(cleanup);
  it("renders rich text editor", async () => {
    let rendered = await withProviders(store, <RichText parentIndex={0} />);
    const editor = rendered.getByTestId("richText");
    expect(editor.innerHTML).toContain("description 1 en");
  });

  it("sets text to H2", async () => {
    const rendered = await withProviders(store, <RichText parentIndex={0} />);
    const user = userEvent.setup();
    await user.click(rendered.getByLabelText("formatH2"));

    const editor = rendered.container.querySelector(".editor-heading-h2 span");
    expect(editor.innerHTML).toContain("description 1 en");
  });

  it("sets text to H3", async () => {
    const rendered = await withProviders(store, <RichText parentIndex={0} />);
    const user = userEvent.setup();
    await user.click(rendered.getByLabelText("formatH3"));
    const editor = rendered.container.querySelector(".editor-heading-h3 span");
    expect(editor.innerHTML).toContain("description 1 en");
  });

  it.skip("sets text to bold", async () => {
    const rendered = await withProviders(store, <RichText parentIndex={0} />);
    const user = userEvent.setup();
    await user.click(rendered.getByLabelText("formatBold"));

    const editor = rendered.container.querySelector(".editor-text-bold span");
    expect(editor.innerHTML).toContain("description 2 en");
  });
});
