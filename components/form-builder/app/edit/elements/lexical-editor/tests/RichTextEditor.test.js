import React from "react";
import { cleanup, render, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";
import { RichTextEditor } from "../RichTextEditor";

const promise = Promise.resolve();

describe("RichTextEditor", () => {
  afterEach(() => {
    cleanup();
  });

  it("Renders the RichTextEditor", async () => {
    //
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

    // rendered.debug();

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

    // Content area has default content and attributes
    expect(contentArea).toHaveAttribute("aria-label", "AriaLabel");
    expect(contentArea).toContainHTML("Here is some test content");
    expect(contentArea).toHaveAttribute("contenteditable", "true");
    expect(contentArea).toHaveAttribute("role", "textbox");
    expect(contentArea).toHaveAttribute("spellcheck", "true");
    expect(contentArea).toHaveAttribute("data-lexical-editor", "true");
  });

  it("Sets and unsets aria-pressed state on Toolbar buttons", async () => {
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

    // rendered.debug();

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
    await user.click(h2);
    expect(h2).toHaveAttribute("aria-pressed", "false");

    await user.click(h3);
    expect(h3).toHaveAttribute("aria-pressed", "true");
    await user.click(h3);
    expect(h3).toHaveAttribute("aria-pressed", "false");

    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "true");
    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "false");

    await user.click(italic);
    expect(italic).toHaveAttribute("aria-pressed", "true");
    await user.click(italic);
    expect(italic).toHaveAttribute("aria-pressed", "false");

    await user.click(bulletList);
    expect(bulletList).toHaveAttribute("aria-pressed", "true");
    await user.click(bulletList);
    expect(bulletList).toHaveAttribute("aria-pressed", "false");

    await user.click(numberedList);
    expect(numberedList).toHaveAttribute("aria-pressed", "true");
    await user.click(numberedList);
    expect(numberedList).toHaveAttribute("aria-pressed", "false");

    await user.click(link);
    expect(link).toHaveAttribute("aria-pressed", "true");
    await user.click(link);
    expect(link).toHaveAttribute("aria-pressed", "false");
  });

  it("Can create links", async () => {
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

    // rendered.debug();

    await act(async () => {
      await promise;
    });

    const user = userEvent.setup();
    const contentArea = rendered.container.querySelector('[id^="editor-"]');
    const linkButton = rendered.container.querySelector('[data-test-id="link-button"]');
    await user.click(linkButton);

    // Doesn't work - trying to find the link editor
    const linkEditor = rendered.container.querySelector('[data-test-id="link-editor"]');

    waitFor(() => {
      expect(linkEditor).toBeInTheDocument();
    });

    // The string is wrapped with a link
    const link = contentArea.querySelector("a");
    expect(link).toHaveAttribute("href", "https://");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(link).toHaveAttribute("class", "editor-link ltr");
    expect(link).toHaveTextContent("Here is some test content");
  });

  it.skip("Updates field on change", async () => {
    // Can I test to see if updateField is called and receives the content and path?
  });
});
