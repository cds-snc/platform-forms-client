import React from "react";
import { cleanup, render, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";
import { RichTextEditor } from "../RichTextEditor";

const promise = Promise.resolve();

describe("RichTextEditor", () => {
  afterEach(() => {
    cleanup();
  });

  it("Renders the RichTextEditor", async () => {
    const rendered = render(
      <Providers form={store.form}>
        <RichTextEditor
          path="path.to.content"
          content="Here is some test content"
          autoFocusEditor={true}
          ariaLabel="AriaLabel"
        />
      </Providers>
    );

    rendered.debug();

    await act(async () => {
      await promise;
    });

    const contentArea = rendered.container.querySelector('[id^="editor-"]');
    const toolbar = rendered.container.querySelector('[data-test-id="toolbar"]');
    const toolbarButtons = rendered.container.querySelectorAll('[data-test-id$="-button"]');

    // Toolbar has aria-controls attribute
    expect(toolbar).toHaveAttribute("aria-controls", contentArea.id);

    // Toolbar contains 7 formatting buttons
    expect(toolbarButtons).toHaveLength(7);

    // Content area has aria-label attribute and default content
    expect(contentArea).toHaveAttribute("aria-label", "AriaLabel");
    expect(contentArea).toContainHTML("Here is some test content");
  });

  it.skip("sets aria-pressed state on Toolbar buttons", async () => {
    const rendered = render(
      <Providers form={store.form}>
        <RichTextEditor
          path="path.to.content"
          content="Here is some test content"
          autoFocusEditor={true}
          ariaLabel="AriaLabel"
        />
      </Providers>
    );

    rendered.debug();

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });

    const user = userEvent.setup();

    // H2 Button
    const h2 = rendered.container.querySelector('[data-test-id="h2-button"]');
    const h3 = rendered.container.querySelector('[data-test-id="h3-button"]');
    const bold = rendered.container.querySelector('[data-test-id="bold-button"]');
    const italic = rendered.container.querySelector('[data-test-id="italic-button"]');
    const bulletList = rendered.container.querySelector('[data-test-id="bullet-list-button"]');
    const numberedList = rendered.container.querySelector('[data-test-id="numbered-list-button"]');
    const link = rendered.container.querySelector('[data-test-id="link-button"]');

    expect(h2).toHaveAttribute("aria-pressed", "false");
    expect(h3).toHaveAttribute("aria-pressed", "false");
    expect(bold).toHaveAttribute("aria-pressed", "false");
    expect(italic).toHaveAttribute("aria-pressed", "false");
    expect(bulletList).toHaveAttribute("aria-pressed", "false");
    expect(numberedList).toHaveAttribute("aria-pressed", "false");
    expect(link).toHaveAttribute("aria-pressed", "false");

    await user.click(h2);
    expect(h2).toHaveAttribute("aria-pressed", "true");

    await user.click(h3);
    expect(h3).toHaveAttribute("aria-pressed", "true");

    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "true");

    await user.click(italic);
    expect(italic).toHaveAttribute("aria-pressed", "true");

    await user.click(bulletList);
    expect(bulletList).toHaveAttribute("aria-pressed", "true");

    await user.click(numberedList);
    expect(numberedList).toHaveAttribute("aria-pressed", "true");

    await user.click(link);
    expect(link).toHaveAttribute("aria-pressed", "true");

    rendered.debug();

    // expect(button).toHaveTextContent("addOption");

    // await user.click(button);

    // const option1 = rendered.getByPlaceholderText("option 1");
    // expect(option1).toHaveAttribute("id", "option--0--1");
    // expect(option1).toHaveAttribute("value", "q1 choice 1");

    // const option2 = rendered.getByPlaceholderText("option 2");
    // expect(option2).toHaveAttribute("id", "option--0--2");
    // expect(option2).toHaveAttribute("value", "q1 choice 2");

    // expect(rendered.container.querySelectorAll("input")).toHaveLength(3);

    // const remove1 = rendered.container.querySelector("#remove--0--1");
    // await user.click(remove1);
    // expect(rendered.container.querySelectorAll("input")).toHaveLength(2);
  });
});
